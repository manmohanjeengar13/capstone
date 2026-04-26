'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { useReports } from '@/hooks/useReports';
import { useReportsStore } from '@/store/useReportsStore';
import { DNAReportFull } from '@/components/reports/DNAReportFull';
import { EmptyState } from '@/components/shared/EmptyState';
import { FileText } from 'lucide-react';

function ReportSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-6 animate-pulse">
      {/* Toolbar skeleton */}
      <div className="flex justify-between">
        <div className="skeleton h-8 w-28 rounded-lg" />
        <div className="flex gap-2">
          <div className="skeleton h-8 w-32 rounded-lg" />
          <div className="skeleton h-8 w-24 rounded-lg" />
        </div>
      </div>
      {/* Header card */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <div className="skeleton h-5 w-48 rounded" />
        <div className="skeleton h-3 w-72 rounded" />
        <div className="skeleton h-16 w-full rounded" />
        <div className="flex gap-2">
          <div className="skeleton h-6 w-24 rounded-md" />
          <div className="skeleton h-6 w-20 rounded-md" />
        </div>
      </div>
      {/* Score cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4 space-y-3">
            <div className="skeleton h-8 w-8 rounded-lg" />
            <div className="skeleton h-6 w-16 rounded" />
            <div className="skeleton h-3 w-full rounded" />
          </div>
        ))}
      </div>
      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton h-8 w-20 rounded-lg" />
        ))}
      </div>
      {/* Content */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="skeleton h-4 w-32 rounded" />
          <div className="skeleton h-3 w-full rounded" />
          <div className="skeleton h-24 w-full rounded-lg" />
        </div>
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="skeleton h-4 w-40 rounded" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-8 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ReportPage({ params }: { params: { id: string } }) {
  const { fetchReport } = useReports();
  const { currentReport, isLoading } = useReportsStore();

  useEffect(() => {
    fetchReport(params.id);
  }, [params.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) return <ReportSkeleton />;

  if (!currentReport) {
    return (
      <div className="flex items-center justify-center min-h-full py-20">
        <EmptyState
          title="Report not found"
          description="This report may have been deleted or you don't have access."
          action={{ label: '← Back to Reports', href: '/reports' }}
          icon={<FileText className="w-8 h-8 text-muted-foreground" />}
        />
      </div>
    );
  }

  return <DNAReportFull report={currentReport} />;
}
