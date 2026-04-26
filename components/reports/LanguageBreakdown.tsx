interface Props {
  languages: Record<string, number>;
}

const PALETTE = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ef4444', // red
  '#06b6d4', // cyan
  '#f97316', // orange
];

function formatBytes(bytes: number): string {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)}MB`;
  if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(0)}KB`;
  return `${bytes}B`;
}

export function LanguageBreakdown({ languages }: Props) {
  const entries = Object.entries(languages).sort(([, a], [, b]) => b - a);
  const total = entries.reduce((sum, [, v]) => sum + v, 0);

  if (total === 0) {
    return <p className="text-sm text-muted-foreground">No language data available.</p>;
  }

  const top7 = entries.slice(0, 7);
  const other = entries.slice(7).reduce((sum, [, v]) => sum + v, 0);
  const displayEntries: [string, number][] =
    other > 0 ? [...top7, ['Other', other]] : top7;

  return (
    <div className="space-y-4">
      {/* Stacked bar */}
      <div className="h-3 rounded-full overflow-hidden flex gap-0.5">
        {displayEntries.map(([lang, bytes], i) => {
          const pct = (bytes / total) * 100;
          if (pct < 0.5) return null;
          return (
            <div
              key={lang}
              title={`${lang}: ${pct.toFixed(1)}%`}
              className="h-full transition-all duration-500"
              style={{
                width: `${pct}%`,
                background: PALETTE[i % PALETTE.length],
                borderRadius: i === 0 ? '99px 0 0 99px' : i === displayEntries.length - 1 ? '0 99px 99px 0' : '0',
              }}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {displayEntries.map(([lang, bytes], i) => {
          const pct = ((bytes / total) * 100).toFixed(1);
          return (
            <div key={lang} className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: PALETTE[i % PALETTE.length] }}
              />
              <span className="text-xs text-foreground font-medium">{lang}</span>
              <span className="text-xs text-muted-foreground font-mono">
                {pct}%
              </span>
              <span className="text-[10px] text-muted-foreground/60 font-mono">
                ({formatBytes(bytes)})
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
