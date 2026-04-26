'use client';
import { X, Dna } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface Props {
  progress: number;
  currentStep: string;
  status: string;
  onCancel: () => void;
}

function DnaHelix() {
  return (
    <div className="flex flex-col gap-2 py-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="dna-strand h-4" style={{ animationDelay: `${i * 0.175}s` }}>
          <div className="dna-dot dna-dot-left" />
          <div className="dna-bridge" />
          <div className="dna-dot dna-dot-right" />
        </div>
      ))}
    </div>
  );
}

const STEP_MESSAGES: Record<string, string> = {
  'Queued':                       'Waiting in queue…',
  'Starting analysis':            'Spinning up analyzers…',
  'Fetching repository metadata': 'Cloning repo metadata from GitHub…',
  'Analyzing file complexity':    'Mapping file structure and complexity…',
  'Analyzing commit patterns':    'Reading commit history (up to 500 commits)…',
  'Identifying risk areas':       'Scanning for security and quality risks…',
  'Profiling developer behavior': 'Analyzing contributor patterns…',
  'Calculating health score':     'Computing overall DNA health score…',
  'Saving report':                'Persisting report to database…',
  'Analysis complete':            'Done! Redirecting to your report…',
};

export function AnalysisProgress({ progress, currentStep, status, onCancel }: Props) {
  const displayStep = STEP_MESSAGES[currentStep] ?? currentStep;
  const isFailed = status === 'FAILED';

  return (
    <div className="w-full max-w-lg mx-auto animate-scale-in">
      <Card className="relative overflow-hidden">
        {/* Ambient glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 60% 40% at 50% 0%, hsl(217 91% 60% / 0.08), transparent)`,
          }}
        />

        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="absolute top-4 right-4 z-10"
          aria-label="Cancel analysis"
        >
          <X className="w-4 h-4" />
        </Button>

        <CardContent className="pt-8 pb-8 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Dna className={cn('w-5 h-5 text-primary', status === 'RUNNING' && 'animate-spin-slow')} />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Analyzing Repository</h2>
              <p className="text-xs text-muted-foreground">Decoding your codebase DNA…</p>
            </div>
          </div>

          {/* DNA Helix */}
          <div className="flex justify-center">
            <div style={{ filter: isFailed ? 'none' : `drop-shadow(0 0 20px hsl(217 91% 60% / 0.35))` }}>
              <DnaHelix />
            </div>
          </div>

          {/* Step label */}
          <div className="text-center">
            <p className={cn('text-sm font-mono', isFailed ? 'text-destructive' : 'text-foreground')}>
              {isFailed ? '❌ Analysis failed' : displayStep}
            </p>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground font-mono">Progress</span>
              <span className={cn('text-sm font-bold font-mono', isFailed ? 'text-destructive' : 'text-primary')}>
                {progress}%
              </span>
            </div>
            <Progress value={progress} className={cn(isFailed && '[&>div]:bg-destructive [&>div]:shadow-none')} />
          </div>

          {/* Step indicators */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Metadata',   threshold: 5 },
              { label: 'Complexity', threshold: 20 },
              { label: 'Commits',    threshold: 45 },
              { label: 'Risk',       threshold: 65 },
            ].map(({ label, threshold }) => (
              <div key={label} className="text-center">
                <div className={cn(
                  'h-1 rounded-full mb-1 transition-all duration-700',
                  progress >= threshold ? 'bg-primary' : 'bg-muted'
                )} />
                <span className="text-[10px] text-muted-foreground font-mono">{label}</span>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={onCancel}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
            >
              Cancel and discard
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
