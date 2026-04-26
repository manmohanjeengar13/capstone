'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { Search, TrendingUp, FileText, Activity, ArrowRight } from 'lucide-react';
import { useSession } from '@/lib/auth-client';
import { useReports } from '@/hooks/useReports';
import { useReportsStore } from '@/store/useReportsStore';
import { cn, formatDate, scoreToColor, gradeToClasses } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/EmptyState';
import type { Report } from '@/types/report';

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  delay: number;
}) {
  return (
    <Card className="card-hover" style={{ animation: `slide-in 0.4s ease-out ${delay}s both` }}>
      <CardContent className="pt-5 pb-5">
        <div className="rounded-lg bg-muted p-2 w-fit mb-3">
          <Icon className="w-4 h-4 text-muted-foreground" />
        </div>
        <p className="text-2xl font-bold text-foreground font-mono">{value}</p>
        <p className="text-sm font-medium text-foreground mt-0.5">{label}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </CardContent>
    </Card>
  );
}

function ReportCard({ report }: { report: Report }) {
  return (
    <Link href={`/reports/${report.id}`} className="group">
      <Card className="card-hover h-full">
        <CardContent className="pt-4 pb-4 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-mono truncate">{report.repoOwner}</p>
              <p className="text-sm font-semibold text-foreground truncate">{report.repoName}</p>
            </div>
            <Badge className={cn('flex-shrink-0', gradeToClasses(report.grade))}>
              {report.grade}
            </Badge>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">Health Score</span>
              <span className={cn('text-xs font-bold font-mono', scoreToColor(report.healthScore))}>
                {Math.round(report.healthScore)}
              </span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${report.healthScore}%`,
                  background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(160 84% 39%))',
                }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-[11px] text-muted-foreground font-mono">{formatDate(report.createdAt)}</p>
            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <Card>
      <CardContent className="pt-4 pb-4 space-y-3">
        <div className="skeleton h-4 w-2/3 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
        <div className="skeleton h-2 w-full rounded" />
        <div className="skeleton h-3 w-1/3 rounded" />
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const { fetchReports } = useReports();
  const { reports, isLoading } = useReportsStore();

  useEffect(() => {
    fetchReports(1, 'createdAt_desc');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const avgScore =
    reports.length > 0
      ? Math.round(reports.reduce((s, r) => s + r.healthScore, 0) / reports.length)
      : 0;

  const recentReports = reports.slice(0, 6);
  const firstName = session?.user?.name?.split(' ')[0] ?? 'there';

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-8">
      <div className="animate-fade-in">
        <h2 className="text-2xl font-bold text-foreground">Welcome back, {firstName} 👋</h2>
        <p className="text-sm text-muted-foreground mt-1">Here's an overview of your repository analyses.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={FileText}   label="Total Reports"   value={reports.length}                                          sub="All time"                                         delay={0.05} />
        <StatCard icon={TrendingUp} label="Avg Health Score" value={reports.length > 0 ? avgScore : '—'}                    sub={reports.length > 0 ? `Across ${reports.length} repos` : 'No data yet'} delay={0.10} />
        <StatCard icon={Activity}   label="Repos Analyzed"  value={new Set(reports.map((r) => r.repoUrl)).size}             sub="Unique repositories"                              delay={0.15} />
      </div>

      {/* Quick analyze CTA */}
      <Card
        className="border-primary/20 bg-gradient-to-r from-primary/10 to-accent/5"
        style={{ animation: 'slide-in 0.4s ease-out 0.2s both' }}
      >
        <CardContent className="pt-5 pb-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-foreground">Analyze a new repository</p>
              <p className="text-xs text-muted-foreground mt-0.5">Get a deep DNA report in under a minute</p>
            </div>
            <Button asChild className="whitespace-nowrap">
              <Link href="/analyze">
                <Search className="w-4 h-4 mr-2" />
                Start Analysis
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent reports */}
      <div style={{ animation: 'slide-in 0.4s ease-out 0.25s both' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-foreground">Recent Reports</h3>
          {reports.length > 6 && (
            <Link href="/reports" className="text-xs text-primary hover:underline">View all →</Link>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : recentReports.length === 0 ? (
          <EmptyState
            title="No reports yet"
            description="Analyze your first repository to see results here."
            action={{ label: 'Analyze a repo', href: '/analyze' }}
            icon={<FileText className="w-8 h-8 text-muted-foreground" />}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentReports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
