'use client';
import { useCallback } from 'react';
import { toast } from 'sonner';
import api from '@/lib/axios';
import { useReportsStore } from '@/store/useReportsStore';
import type { ApiResponse, PaginatedResponse } from '@/types/api';
import type { Report } from '@/types/report';

export function useReports() {
  const { setReports, setCurrentReport, removeReport, setLoading } = useReportsStore();

  const fetchReports = useCallback(
    async (page = 1, sort = 'createdAt_desc') => {
      setLoading(true);
      try {
        const { data } = await api.get<PaginatedResponse<Report>>(
          `/api/reports?page=${page}&limit=10&sort=${sort}`
        );
        setReports(data.data, {
          page: data.page,
          total: data.total,
          hasMore: data.hasMore,
        });
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Failed to load reports';
        toast.error('Failed to load reports', { description: msg });
      } finally {
        setLoading(false);
      }
    },
    [setReports, setLoading]
  );

  const fetchReport = useCallback(
    async (id: string) => {
      setLoading(true);
      try {
        const { data } = await api.get<ApiResponse<Report & { rawData?: unknown }>>(
          `/api/reports/${id}`
        );
        if (data.data) setCurrentReport(data.data);
        return data.data;
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Failed to load report';
        toast.error('Failed to load report', { description: msg });
        return null;
      } finally {
        setLoading(false);
      }
    },
    [setCurrentReport, setLoading]
  );

  const deleteReport = useCallback(
    async (id: string) => {
      try {
        await api.delete(`/api/reports/${id}`);
        removeReport(id);
        toast.success('Report deleted');
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Failed to delete report';
        toast.error('Failed to delete report', { description: msg });
        throw error;
      }
    },
    [removeReport]
  );

  return { fetchReports, fetchReport, deleteReport };
}
