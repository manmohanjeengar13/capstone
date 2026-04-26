'use client';
import type { ActivityHeatmap } from '@/types/report';

interface Props {
  heatmap: ActivityHeatmap;
}

const DAYS  = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const HOUR_LABELS = ['12a', '3a', '6a', '9a', '12p', '3p', '6p', '9p'];

function getIntensity(value: number, max: number): number {
  if (max === 0 || value === 0) return 0;
  return Math.ceil((value / max) * 4); // 1–4
}

const INTENSITY_CLASSES: Record<number, string> = {
  0: 'bg-muted/40',
  1: 'bg-blue-900/60',
  2: 'bg-blue-700/70',
  3: 'bg-blue-500/80',
  4: 'bg-blue-400',
};

export function ActivityGrid({ heatmap }: Props) {
  const { grid, peakDay, peakHour } = heatmap;

  const maxVal = Math.max(1, ...grid.flatMap((row) => row));

  const totalCommits = grid.flatMap((r) => r).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-foreground">Commit Activity</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {totalCommits.toLocaleString()} commits · Peak: {DAYS[peakDay]} at{' '}
            {peakHour === 0 ? '12am' : peakHour === 12 ? '12pm' : peakHour > 12 ? `${peakHour - 12}pm` : `${peakHour}am`}
          </p>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-muted-foreground">Less</span>
          {[0, 1, 2, 3, 4].map((l) => (
            <div
              key={l}
              className={`w-3 h-3 rounded-sm ${INTENSITY_CLASSES[l]}`}
            />
          ))}
          <span className="text-[10px] text-muted-foreground">More</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[520px]">
          {/* Hour labels */}
          <div className="flex mb-1 ml-10">
            {HOURS.map((h) => (
              <div key={h} className="flex-1 text-center">
                {h % 3 === 0 && (
                  <span className="text-[9px] text-muted-foreground/60 font-mono">
                    {HOUR_LABELS[h / 3]}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Grid */}
          {DAYS.map((day, d) => (
            <div key={day} className="flex items-center gap-1 mb-1">
              <span className="w-8 text-[10px] text-muted-foreground font-mono flex-shrink-0 text-right pr-1">
                {day}
              </span>
              <div className="flex flex-1 gap-0.5">
                {HOURS.map((h) => {
                  const val = grid[d]?.[h] ?? 0;
                  const level = getIntensity(val, maxVal);
                  const isPeak = d === peakDay && h === peakHour;

                  return (
                    <div
                      key={h}
                      title={`${day} ${h}:00 — ${val} commit${val !== 1 ? 's' : ''}`}
                      className={`
                        flex-1 aspect-square rounded-[2px] heatmap-cell
                        ${INTENSITY_CLASSES[level]}
                        ${isPeak ? 'ring-1 ring-primary ring-offset-1 ring-offset-background' : ''}
                      `}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
