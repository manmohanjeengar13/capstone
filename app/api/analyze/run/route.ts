import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/crypto';
import { logger } from '@/lib/logger';
import { runAnalysisPipeline } from '@/analyzers';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!;

/**
 * Internal route — called by analyze.service.ts (fire-and-forget) to run
 * the analysis pipeline inside its own Vercel serverless function invocation.
 *
 * Protected by x-worker-secret header so it cannot be triggered externally.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  // Verify internal secret
  const secret = process.env.WORKER_SECRET ?? process.env.BETTER_AUTH_SECRET!;
  const incoming = req.headers.get('x-worker-secret');
  if (!incoming || incoming !== secret) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let jobId = '';
  try {
    const body = await req.json();
    jobId = body.jobId;
    const { repoOwner, repoName, encryptedToken } = body;

    if (!jobId || !repoOwner || !repoName || !encryptedToken) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

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

    logger.info(`[run-route] Job ${jobId} completed`);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    logger.error(`[run-route] Job ${jobId} failed: ${msg}`);

    if (jobId) {
      await prisma.analysisJob.update({
        where: { id: jobId },
        data: { status: 'FAILED', currentStep: 'Analysis failed', errorMsg: msg },
      }).catch(() => {});
    }

    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// Tell Vercel to allow up to 300 seconds (Pro plan) for this function
export const maxDuration = 300;