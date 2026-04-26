'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { JobStatus, AnalysisProgress } from '@/types/analysis';

interface State {
  jobId: string | null;
  status: JobStatus | null;
  progress: number;
  currentStep: string;
  reportId: string | null;
  error: string | null;
}

interface Actions {
  startJob: (jobId: string) => void;
  updateProgress: (p: AnalysisProgress) => void;
  completeJob: (reportId: string) => void;
  failJob: (error: string) => void;
  reset: () => void;
}

const initialState: State = {
  jobId: null,
  status: null,
  progress: 0,
  currentStep: '',
  reportId: null,
  error: null,
};

const ssrStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const useAnalysisStore = create<State & Actions>()(
  persist(
    (set) => ({
      ...initialState,
      startJob: (jobId) =>
        set({ ...initialState, jobId, status: 'PENDING', currentStep: 'Queued' }),
      updateProgress: (p) =>
        set({
          status: p.status,
          progress: p.progress,
          currentStep: p.currentStep,
          reportId: p.reportId ?? null,
          error: p.errorMsg ?? null,
        }),
      completeJob: (reportId) =>
        set({ status: 'COMPLETED', progress: 100, currentStep: 'Complete', reportId }),
      failJob: (error) =>
        set({ status: 'FAILED', error }),
      reset: () => set(initialState),
    }),
    {
      name: 'dna-analysis',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? sessionStorage : ssrStorage
      ),
    }
  )
);
