import { analysisQueue } from './analysis.queue';
import { runAnalysisPipeline } from '@/analyzers';
import { prisma } from '@/lib/prisma';
import { decrypt } from '@/lib/crypto';
import { logger } from '@/lib/logger';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!;

/**
 * Start the Bull worker process with concurrency of 3.
 */
export function startWorker(): void {
  analysisQueue.process(3, async (job) => {
    const { jobId, repoOwner, repoName, encryptedToken } = job.data;

    logger.info(`Worker processing job ${jobId} for ${repoOwner}/${repoName}`);

    await prisma.analysisJob.update({
      where: { id: jobId },
      data: { status: 'RUNNING', currentStep: 'Starting analysis' },
    });

    const token = decrypt(encryptedToken, ENCRYPTION_KEY);

    const updateProgress = async (progress: number, step: string) => {
      await Promise.all([
        prisma.analysisJob.update({
          where: { id: jobId },
          data: { progress, currentStep: step },
        }),
        job.progress(progress),
      ]);
    };

    await runAnalysisPipeline(jobId, repoOwner, repoName, token, updateProgress);
  });

  analysisQueue.on('completed', (job) => {
    logger.info(`Job ${job.id} completed successfully`);
  });

  analysisQueue.on('failed', (job, err) => {
    logger.error(`Job ${job?.id} failed: ${err.message}`, { stack: err.stack });
  });

  analysisQueue.on('stalled', (job) => {
    logger.warn(`Job ${job.id} stalled — will be retried`);
  });

  analysisQueue.on('error', (err) => {
    logger.error(`Queue error: ${err.message}`);
  });

  logger.info('Analysis worker started (concurrency: 3)');
}
