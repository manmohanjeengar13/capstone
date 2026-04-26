import { prisma } from '@/lib/prisma';
import { decrypt, encrypt } from '@/lib/crypto';
import { logger } from '@/lib/logger';
import { addAnalysisJob } from '@/queue/analysis.queue';
import { runAnalysisPipeline } from '@/analyzers';
import { AppError } from '@/types/api';
import type { AnalysisProgress } from '@/types/analysis';
import type { AuthUser } from './auth.service';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!;
const QUEUE_ENQUEUE_TIMEOUT_MS = 5000;

/**
 * Parse owner/repo from a GitHub URL.
 */
export function parseGithubUrl(repoUrl: string): { owner: string; repo: string } {
  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/?\s]+)/);
  if (!match) {
    throw new AppError('Invalid GitHub URL. Expected: https://github.com/owner/repo', 400);
  }
  return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
}

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

async function runAnalysisInProcess(
  jobId: string,
  repoOwner: string,
  repoName: string,
  encryptedToken: string
): Promise<void> {
  await prisma.analysisJob.update({
    where: { id: jobId },
    data: { status: 'RUNNING', currentStep: 'Starting local analysis' },
  });

  const token = decrypt(encryptedToken, ENCRYPTION_KEY);

  const updateProgress = async (progress: number, step: string) => {
    await prisma.analysisJob.update({
      where: { id: jobId },
      data: { progress, currentStep: step },
    });
  };

  await runAnalysisPipeline(jobId, repoOwner, repoName, token, updateProgress);
}

/**
 * Create an AnalysisJob in the DB and enqueue it for processing.
 * Returns the new jobId.
 */
export async function createAndEnqueueJob(
  repoUrl: string,
  user: AuthUser,
  decryptedToken: string
): Promise<string> {
  const { owner, repo } = parseGithubUrl(repoUrl);

  const job = await prisma.analysisJob.create({
    data: {
      userId: user.id,
      repoUrl,
      repoOwner: owner,
      repoName: repo,
      status: 'PENDING',
      progress: 0,
      currentStep: 'Queued',
    },
  });

  const encryptedToken = encrypt(decryptedToken, ENCRYPTION_KEY);
  const payload = {
    jobId: job.id,
    repoUrl,
    repoOwner: owner,
    repoName: repo,
    userId: user.id,
    encryptedToken,
  };

  if (process.env.NODE_ENV === 'development') {
    setTimeout(() => {
      void runAnalysisInProcess(job.id, owner, repo, encryptedToken).catch((error) => {
        logger.error(
          `[analysis] local fallback failed for ${job.id}: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      });
    }, 0);

    return job.id;
  }

  try {
    await withTimeout(
      addAnalysisJob(payload),
      QUEUE_ENQUEUE_TIMEOUT_MS,
      `Queue enqueue timed out after ${QUEUE_ENQUEUE_TIMEOUT_MS}ms`
    );
  } catch (error) {
    await prisma.analysisJob.update({
      where: { id: job.id },
      data: {
        status: 'FAILED',
        currentStep: 'Queue unavailable',
        errorMsg: 'Analysis queue is unavailable. Please try again.',
      },
    });

    logger.error(
      `[analysis] failed to enqueue ${job.id}: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
    throw new AppError('Analysis queue is unavailable. Please try again.', 503);
  }

  return job.id;
}

/**
 * Get the current progress/status of an analysis job.
 * Throws 404 if not found or not owned by user.
 */
export async function getJobProgress(
  jobId: string,
  userId: string
): Promise<AnalysisProgress> {
  const job = await prisma.analysisJob.findFirst({
    where: { id: jobId, userId },
    include: {
      report: { select: { id: true } },
    },
  });

  if (!job) {
    throw new AppError('Analysis job not found', 404);
  }

  return {
    jobId: job.id,
    status: job.status as AnalysisProgress['status'],
    progress: job.progress,
    currentStep: job.currentStep ?? '',
    reportId: job.report?.id,
    errorMsg: job.errorMsg ?? undefined,
  };
}
