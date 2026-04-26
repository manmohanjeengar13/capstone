import Bull from 'bull';
import type { AnalysisJobPayload } from '@/types/analysis';

// analysisQueue is only used by the local worker process (worker.ts).
// On Vercel (no REDIS_URL), this module is imported but the queue is never
// actually used — analysis runs via /api/analyze/run instead.
export const analysisQueue = new Bull<AnalysisJobPayload>('analysis', {
  redis: process.env.REDIS_URL ?? 'redis://localhost:6379',
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: { age: 86400 },  // keep 24h
    removeOnFail: { age: 259200 },     // keep 72h
  },
});

/**
 * Enqueue a new analysis job. Uses jobId as the Bull job ID for idempotency.
 */
export async function addAnalysisJob(payload: AnalysisJobPayload): Promise<void> {
  await analysisQueue.add(payload, { jobId: payload.jobId });
}