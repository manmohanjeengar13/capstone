import { Layers, GitCommit, ShieldAlert, Zap } from 'lucide-react';
import { cn, scoreToColor, scoreToBg } from '@/lib/utils';
import type { SubScores } from '@/types/report';

interface Props {
  subScores: SubScores;
}

interface CardConfig {
  key: keyof SubScores;
  label: string;
  icon: React.ElementType;
  description: string;
  invert?: boolean;   // show (100 - value) as the "health" number
}

const CARDS: CardConfig[] = [
  {
    key: 'complexity',
    label: 'Complexity',
    icon: Layers,
    description: 'Codebase structural complexity',
  },
  {
    key: 'commits',
    label: 'Commit Health',
    icon: GitCommit,
    description: 'Hygiene, velocity & gaps',
  },
  {
    key: 'risk',
    label: 'Risk Level',
    icon: ShieldAlert,
    description: 'Security & staleness risk',
    invert: true,
  },
  {
    key: 'velocity',
    label: 'Velocity',
    icon: Zap,
    description: 'Weekly development cadence',
  },
];

function MiniBar({ value, inverted }: { value: number; inverted?: boolean }) {
  const display = inverted ? 100 - value : value;
  return (
    <div className="progress-bar mt-3">
      <div
        className={cn('progress-fill', inverted && value > 60 ? 'bg-red-500' : '')}
        style={{ width: `${display}%` }}
      />
    </div>
  );
}

export function SubScoreCards({ subScores }: Props) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {CARDS.map(({ key, label, icon: Icon, description, invert }, i) => {
        const raw = subScores[key];
        const display = invert ? 100 - raw : raw;
        const colorClass = scoreToColor(display);

        return (
          <div
            key={key}
            className={cn(
              'bg-card border border-border rounded-xl p-4 card-hover',
              `stagger-${i + 1}`
            )}
          >
            <div className="flex items-start justify-between mb-1">
              <div className="rounded-lg bg-muted p-2">
                <Icon className="w-4 h-4 text-muted-foreground" />
              </div>
              <span className={cn('text-2xl font-bold font-mono', colorClass)}>
                {display}
              </span>
            </div>
            <p className="text-sm font-semibold text-foreground mt-2">{label}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{description}</p>
            <MiniBar value={raw} inverted={invert} />
          </div>
        );
      })}
    </div>
  );
}
