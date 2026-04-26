'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Eye, Trash2, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useReports } from '@/hooks/useReports';
import { useReportsStore } from '@/store/useReportsStore';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { cn, formatDate, scoreToColor, gradeToClasses } from '@/lib/utils';
import type { Report } from '@/types/report';

function SkeletonRow() {
  return (
    <TableRow>
      {Array.from({ length: 5 }).map((_, i) => (
        <TableCell key={i}>
          <div className="skeleton h-4 w-full rounded" />
        </TableCell>
      ))}
    </TableRow>
  );
}

export default function ReportsPage() {
  const { fetchReports, deleteReport } = useReports();
  const { reports, pagination, isLoading } = useReportsStore();

  const [page, setPage]               = useState(1);
  const [sort, setSort]               = useState('createdAt_desc');
  const [deleteTarget, setDeleteTarget] = useState<Report | null>(null);

  useEffect(() => {
    fetchReports(page, sort);
  }, [page, sort]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteReport(deleteTarget.id);
    setDeleteTarget(null);
    fetchReports(page, sort);
  };

  const totalPages = Math.ceil(pagination.total / 10);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">Analysis Reports</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {pagination.total} report{pagination.total !== 1 ? 's' : ''} total
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={sort} onValueChange={(v) => { setSort(v); setPage(1); }}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Sort by…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt_desc">Newest first</SelectItem>
              <SelectItem value="createdAt_asc">Oldest first</SelectItem>
              <SelectItem value="healthScore_desc">Score: High → Low</SelectItem>
              <SelectItem value="healthScore_asc">Score: Low → High</SelectItem>
            </SelectContent>
          </Select>

          <Button asChild>
            <Link href="/analyze">
              <Search className="w-4 h-4 mr-2" />
              New Analysis
            </Link>
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              {['Repository', 'Date', 'Health Score', 'Grade', 'Actions'].map((h) => (
                <TableHead key={h}>{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            ) : reports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <EmptyState
                    title="No reports yet"
                    description="Run your first analysis to see reports here."
                    action={{ label: 'Analyze a repo', href: '/analyze' }}
                  />
                </TableCell>
              </TableRow>
            ) : (
              reports.map((report, i) => (
                <TableRow
                  key={report.id}
                  style={{ animation: `slide-in 0.3s ease-out ${i * 0.04}s both` }}
                >
                  <TableCell>
                    <div>
                      <p className="text-xs text-muted-foreground font-mono">{report.repoOwner}</p>
                      <p className="text-sm font-semibold text-foreground">{report.repoName}</p>
                    </div>
                  </TableCell>

                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap font-mono">
                    {formatDate(report.createdAt)}
                  </TableCell>

                  <TableCell className="min-w-[140px]">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${report.healthScore}%`,
                            background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(160 84% 39%))',
                          }}
                        />
                      </div>
                      <span className={cn('text-xs font-bold font-mono w-8 text-right', scoreToColor(report.healthScore))}>
                        {Math.round(report.healthScore)}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge className={gradeToClasses(report.grade)}>{report.grade}</Badge>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/reports/${report.id}`} title="View report">
                          <Eye className="w-4 h-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteTarget(report)}
                        className="text-muted-foreground hover:text-destructive"
                        title="Delete report"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Page {page} of {totalPages} · {pagination.total} reports
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
              <Button
                key={i + 1}
                variant={page === i + 1 ? 'default' : 'outline'}
                size="icon"
                onClick={() => setPage(i + 1)}
                className="font-mono text-xs"
              >
                {i + 1}
              </Button>
            ))}
            <Button variant="outline" size="icon" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete Report"
        description={`Are you sure you want to delete the report for ${deleteTarget?.repoOwner}/${deleteTarget?.repoName}? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
