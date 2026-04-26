'use client';
import { useState } from 'react';
import { ChevronDown, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RiskArea, RiskSeverity } from '@/types/report';

interface Props {
  riskAreas: RiskArea[];
}

const SEVERITY_CONFIG: Record<RiskSeverity, { label: string; classes: string; dot: string }> = {
  CRITICAL: { label: 'Critical', classes: 'bg-red-500/10 text-red-400 border-red-500/30',       dot: 'bg-red-400' },
  HIGH:     { label: 'High',     classes: 'bg-orange-500/10 text-orange-400 border-orange-500/30', dot: 'bg-orange-400' },
  MEDIUM:   { label: 'Medium',   classes: 'bg-amber-500/10 text-amber-400 border-amber-500/30',  dot: 'bg-amber-400' },
  LOW:      { label: 'Low',      classes: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-400' },
};

const SEVERITY_ORDER: RiskSeverity[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

function RiskItem({ area }: { area: RiskArea }) {
  const [open, setOpen] = useState(false);
  const cfg = SEVERITY_CONFIG[area.severity];

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors text-left"
      >
        <div className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', cfg.dot)} />
        <span className="flex-1 text-sm text-foreground font-mono truncate">{area.file}</span>
        <span className={cn('badge text-[10px] flex-shrink-0', cfg.classes)}>
          {cfg.label}
        </span>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform duration-200',
            open && 'rotate-180'
          )}
        />
      </button>

      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-border bg-muted/20">
          <p className="text-sm text-foreground mb-2">{area.reason}</p>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-muted border border-border">
            <span className="text-[11px] font-mono text-muted-foreground">{area.metric}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function RiskAreasList({ riskAreas }: Props) {
  if (riskAreas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <CheckCircle className="w-6 h-6 text-emerald-400" />
        </div>
        <p className="text-sm font-semibold text-foreground">No significant risks detected</p>
        <p className="text-xs text-muted-foreground">This repository passed all risk checks.</p>
      </div>
    );
  }

  // Sort by severity
  const sorted = [...riskAreas].sort(
    (a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity)
  );

  const counts = SEVERITY_ORDER.reduce(
    (acc, sev) => {
      acc[sev] = riskAreas.filter((r) => r.severity === sev).length;
      return acc;
    },
    {} as Record<RiskSeverity, number>
  );

  return (
    <div className="space-y-4">
      {/* Summary row */}
      <div className="flex flex-wrap gap-2">
        {SEVERITY_ORDER.map((sev) =>
          counts[sev] > 0 ? (
            <span key={sev} className={cn('badge', SEVERITY_CONFIG[sev].classes)}>
              {counts[sev]} {SEVERITY_CONFIG[sev].label}
            </span>
          ) : null
        )}
      </div>

      {/* Items */}
      <div className="space-y-2">
        {sorted.map((area, i) => (
          <RiskItem key={`${area.file}-${i}`} area={area} />
        ))}
      </div>
    </div>
  );
}
