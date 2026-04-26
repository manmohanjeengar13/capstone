'use client';
import { useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { useAnalysisStore } from '@/store/useAnalysisStore';
import type { AnalysisProgress } from '@/types/analysis';
import type { ApiResponse } from '@/types/api';

const POLL_INTERVAL = 3000;

export function useAnalysis() {
  const router = useRouter();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { jobId, status, startJob, updateProgress, completeJob, failJob, reset } =
    useAnalysisStore();

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const pollJob = useCallback(
    (id: string) => {
      stopPolling();
      intervalRef.current = setInterval(async () => {
        try {
          const { data } = await api.get<ApiResponse<AnalysisProgress>>(
            `/api/analyze/${id}`
          );
          const progress = data.data;
          if (!progress) return;

          updateProgress(progress);

          if (progress.status === 'COMPLETED' && progress.reportId) {
            stopPolling();
            completeJob(progress.reportId);
            toast.success('Analysis complete!', { description: 'Your DNA report is ready.' });
            router.push(`/reports/${progress.reportId}`);
          } else if (progress.status === 'FAILED') {
            stopPolling();
            failJob(progress.errorMsg ?? 'Analysis failed');
            toast.error('Analysis failed', {
              description: progress.errorMsg ?? 'An unexpected error occurred.',
            });
          }
        } catch {
          // Network error — keep polling, don't surface noise
        }
      }, POLL_INTERVAL);
    },
    [stopPolling, updateProgress, completeJob, failJob, router]
  );

  // Auto-resume polling on mount if job is active
  useEffect(() => {
    if (jobId && (status === 'PENDING' || status === 'RUNNING')) {
      pollJob(jobId);
    }
    return stopPolling;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const submitRepo = useCallback(
    async (repoUrl: string) => {
      try {
        const { data } = await api.post<ApiResponse<{ jobId: string; status: string }>>(
          '/api/analyze',
          { repoUrl }
        );
        if (!data.data?.jobId) throw new Error(data.error ?? 'No job ID returned');
        const newJobId = data.data.jobId;
        startJob(newJobId);
        toast.info('Analysis started', { description: 'Analyzing your repository…' });
        pollJob(newJobId);
        return newJobId;
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Failed to start analysis';
        toast.error('Failed to start analysis', { description: msg });
        throw error;
      }
    },
    [startJob, pollJob]
  );

  const cancelJob = useCallback(() => {
    stopPolling();
    reset();
  }, [stopPolling, reset]);

  return { submitRepo, cancelJob, pollJob };
}
