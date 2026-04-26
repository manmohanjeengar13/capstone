import { cn, formatDateRelative } from '@/lib/utils';
import type { ContributorInsight } from '@/types/report';

interface Props {
  contributors: ContributorInsight[];
}

export function ContributorMatrix({ contributors }: Props) {
  if (!contributors.length) {
    return (
      <p className="text-sm text-muted-foreground py-6 text-center">
        No contributor data available.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            {['Contributor', 'Commits', 'Ownership', 'Lines Added', 'Lines Deleted', 'Churn', 'Last Active', 'Status'].map((h) => (
              <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {contributors.map((c, i) => (
            <tr
              key={c.login}
              className={cn(
                'border-b border-border/50 transition-colors hover:bg-muted/20',
                i === contributors.length - 1 && 'border-0'
              )}
            >
              {/* Contributor */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-2.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={c.avatarUrl}
                    alt={c.login}
                    className="w-6 h-6 rounded-full bg-muted"
                    onError={(e) => { (e.target as HTMLImageElement).src = `https://avatars.githubusercontent.com/u/0?s=24`; }}
                  />
                  <span className="font-mono text-sm text-foreground">{c.login}</span>
                </div>
              </td>

              {/* Commits */}
              <td className="px-4 py-3 font-mono text-sm text-foreground">
                {c.commitCount.toLocaleString()}
              </td>

              {/* Ownership bar */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-2 min-w-[90px]">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${Math.min(c.ownershipPercent, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground w-10 text-right">
                    {c.ownershipPercent}%
                  </span>
                </div>
              </td>

              {/* Lines Added */}
              <td className="px-4 py-3 font-mono text-xs text-emerald-400">
                +{c.linesAdded.toLocaleString()}
              </td>

              {/* Lines Deleted */}
              <td className="px-4 py-3 font-mono text-xs text-red-400">
                -{c.linesDeleted.toLocaleString()}
              </td>

              {/* Churn */}
              <td className={cn('px-4 py-3 font-mono text-xs', c.churnRatio > 1.5 ? 'text-orange-400' : 'text-muted-foreground')}>
                {c.churnRatio.toFixed(2)}
              </td>

              {/* Last active */}
              <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                {formatDateRelative(c.lastActiveAt)}
              </td>

              {/* Status */}
              <td className="px-4 py-3">
                {c.isGhost ? (
                  <span className="badge bg-red-500/10 text-red-400 border-red-500/30">Ghost</span>
                ) : (
                  <span className="badge bg-emerald-500/10 text-emerald-400 border-emerald-500/30">Active</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
