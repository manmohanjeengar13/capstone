import { prisma } from '@/lib/prisma';
import { decrypt, encrypt } from '@/lib/crypto';
import { logger } from '@/lib/logger';
import { runAnalysisPipeline } from '@/analyzers';
import { AppError } from '@/types/api';
import type { AnalysisProgress } from '@/types/analysis';
import type { AuthUser } from './auth.service';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!;

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

/**
 * Run analysis in-process (used in both development and production on Vercel,
 * where persistent Bull workers are not available).
 */
async function runAnalysisInProcess(
  jobId: string,
  repoOwner: string,
  repoName: string,
  encryptedToken: string
): Promise<void> {
  await prisma.analysisJob.update({
    where: { id: jobId },
    data: { status: 'RUNNING', currentStep: 'Starting analysis' },
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
 * Trigger analysis via a self-call to /api/analyze/run so Vercel executes it
 * as a separate serverless function invocation (fire-and-forget).
 * This avoids needing Bull or a persistent worker process.
 */
async function triggerAnalysisViaHttp(payload: {
  jobId: string;
  repoOwner: string;
  repoName: string;
  encryptedToken: string;
}): Promise<void> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
  const secret = process.env.WORKER_SECRET ?? process.env.BETTER_AUTH_SECRET!;

  // Fire and forget — we don't await the response, Vercel runs it independently
  fetch(`${appUrl}/api/analyze/run`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Internal secret so /api/analyze/run rejects outside calls
      'x-worker-secret': secret,
    },
    body: JSON.stringify(payload),
  }).catch((err) => {
    logger.error(`[analysis] failed to trigger run route for ${payload.jobId}: ${err.message}`);
  });
}

/**
 * Create an AnalysisJob in the DB and kick off processing.
 * - In development: runs in-process via setTimeout (existing behaviour).
 * - In production (Vercel): fires an HTTP call to /api/analyze/run which
 *   executes the pipeline in its own serverless function invocation.
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
          `[analysis] local run failed for ${job.id}: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`
        );
      });
    }, 0);

    return job.id;
  }

  // Production: trigger via HTTP so it runs in its own Vercel function invocation
  await triggerAnalysisViaHttp(payload);

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