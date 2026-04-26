import { Ghost } from 'lucide-react';
import { cn, formatDateRelative } from '@/lib/utils';
import type { ContributorInsight } from '@/types/report';

interface Props {
  contributors: ContributorInsight[];
}

interface StatCellProps {
  label: string;
  value: string | number;
  highlight?: string;
}

function StatCell({ label, value, highlight }: StatCellProps) {
  return (
    <div className="bg-muted/40 rounded-lg p-2.5">
      <p className="text-[10px] text-muted-foreground mb-0.5">{label}</p>
      <p className={cn('text-sm font-mono font-semibold', highlight ?? 'text-foreground')}>
        {value}
      </p>
    </div>
  );
}

export function DeveloperInsights({ contributors }: Props) {
  if (!contributors.length) {
    return (
      <p className="text-sm text-muted-foreground py-6 text-center">
        No contributor insights available.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {contributors.map((c, i) => (
        <div
          key={c.login}
          className={cn(
            'bg-card border border-border rounded-xl p-4 card-hover',
            `stagger-${Math.min(i + 1, 6)}`
          )}
        >
          {/* Header */}
          <div className="flex items-start gap-3 mb-3">
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={c.avatarUrl}
                alt={c.login}
                className="w-10 h-10 rounded-full bg-muted ring-2 ring-border"
                onError={(e) => { (e.target as HTMLImageElement).src = `https://avatars.githubusercontent.com/u/0?s=40`; }}
              />
              {c.isGhost && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center">
                  <Ghost className="w-2.5 h-2.5 text-red-400" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold text-foreground font-mono truncate">
                  {c.login}
                </p>
                {c.isGhost && (
                  <span className="badge text-[10px] bg-red-500/10 text-red-400 border-red-500/30">
                    Inactive
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {c.ownershipPercent}% ownership · last {formatDateRelative(c.lastActiveAt)}
              </p>
            </div>
          </div>

          {/* Ownership bar */}
          <div className="progress-bar mb-3">
            <div
              className="progress-fill"
              style={{ width: `${Math.min(c.ownershipPercent, 100)}%` }}
            />
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-2">
            <StatCell label="Commits" value={c.commitCount.toLocaleString()} />
            <StatCell
              label="Churn Ratio"
              value={c.churnRatio.toFixed(2)}
              highlight={c.churnRatio > 1.5 ? 'text-orange-400' : undefined}
            />
            <StatCell
              label="Lines Added"
              value={`+${c.linesAdded.toLocaleString()}`}
              highlight="text-emerald-400"
            />
            <StatCell
              label="Lines Deleted"
              value={`-${c.linesDeleted.toLocaleString()}`}
              highlight="text-red-400"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
