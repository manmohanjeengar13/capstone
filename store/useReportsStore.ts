'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Report } from '@/types/report';

interface Pagination {
  page: number;
  total: number;
  hasMore: boolean;
}

interface State {
  reports: Report[];
  currentReport: (Report & { rawData?: unknown }) | null;
  pagination: Pagination;
  isLoading: boolean;
}

interface Actions {
  setReports: (reports: Report[], pagination: Pagination) => void;
  setCurrentReport: (report: (Report & { rawData?: unknown }) | null) => void;
  appendReports: (reports: Report[]) => void;
  removeReport: (id: string) => void;
  setLoading: (loading: boolean) => void;
}

const lsrStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const useReportsStore = create<State & Actions>()(
  persist(
    (set) => ({
      reports: [],
      currentReport: null,
      pagination: { page: 1, total: 0, hasMore: false },
      isLoading: false,
      setReports: (reports, pagination) => set({ reports, pagination }),
      setCurrentReport: (currentReport) => set({ currentReport }),
      appendReports: (newReports) =>
        set((s) => ({ reports: [...s.reports, ...newReports] })),
      removeReport: (id) =>
        set((s) => ({ reports: s.reports.filter((r) => r.id !== id) })),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'dna-reports',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : lsrStorage
      ),
      // Don't persist currentReport — always fresh from API
      partialize: (state) => ({ reports: state.reports, pagination: state.pagination }),
    }
  )
);
