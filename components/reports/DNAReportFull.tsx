'use client';
import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Printer, ExternalLink, Bus, AlertTriangle,
  GitCommit, Zap, LayoutGrid, Activity, Shield, Users, Code2,
} from 'lucide-react';
import { cn, formatDate, scoreToColor } from '@/lib/utils';
import { HealthScoreGauge } from './HealthScoreGauge';
import { SubScoreCards } from './SubScoreCards';
import { ActivityGrid } from './ActivityGrid';
import { RiskAreasList } from './RiskAreasList';
import { ContributorMatrix } from './ContributorMatrix';
import { DeveloperInsights } from './DeveloperInsights';
import { LanguageBreakdown } from './LanguageBreakdown';
import { ComplexityFileList } from './ComplexityFileList';
import type { Report } from '@/types/report';

interface Props {
  report: Report & { rawData?: unknown };
}

const TABS = [
  { id: 'overview',      label: 'Overview',      icon: LayoutGrid },
  { id: 'commits',       label: 'Commits',       icon: Activity },
  { id: 'risk',          label: 'Risk',          icon: Shield },
  { id: 'contributors',  label: 'Contributors',  icon: Users },
  { id: 'raw',           label: 'Raw Data',      icon: Code2 },
] as const;

type TabId = typeof TABS[number]['id'];

export function DNAReportFull({ report }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-6 animate-fade-in">
      {/* Toolbar */}
      <div className="flex items-center justify-between no-print">
        <Link href="/reports" className="btn-ghost gap-2 text-sm">
          <ArrowLeft className="w-4 h-4" />
          All Reports
        </Link>
        <div className="flex items-center gap-2">
          <a
            href={report.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary gap-2 text-sm"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View on GitHub
          </a>
          <button
            onClick={() => window.print()}
            className="btn-secondary gap-2 text-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            Export
          </button>
        </div>
      </div>

      {/* Repo Header Card */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left: info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-muted-foreground">{report.repoOwner}</span>
              <span className="text-muted-foreground/40">/</span>
              <span className="text-sm font-bold text-foreground">{report.repoName}</span>
            </div>
            <a
              href={report.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline font-mono"
            >
              {report.repoUrl}
            </a>

            <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-2xl">
              {report.summary}
            </p>

            {/* Meta chips */}
            <div className="flex flex-wrap gap-2 mt-4">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted border border-border text-xs">
                <Bus className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Bus factor:</span>
                <span
                  className={cn(
                    'font-semibold',
                    report.busFactor <= 1
                      ? 'text-red-400'
                      : report.busFactor <= 2
                        ? 'text-amber-400'
                        : 'text-emerald-400'
                  )}
                >
                  {report.busFactor}
                </span>
              </div>

              {report.busFactor <= 1 && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Single point of failure
                </div>
              )}

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted border border-border text-xs text-muted-foreground">
                <GitCommit className="w-3.5 h-3.5" />
                {report.contributorInsights?.length ?? 0} contributors
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted border border-border text-xs text-muted-foreground">
                <Zap className="w-3.5 h-3.5" />
                {report.subScores.velocity}/100 velocity
              </div>

              <span className="px-2.5 py-1 rounded-md bg-muted border border-border text-xs text-muted-foreground font-mono">
                Analyzed {formatDate(report.createdAt)}
              </span>
            </div>
          </div>

          {/* Right: gauge */}
          <div className="flex flex-col items-center gap-3 lg:border-l lg:border-border lg:pl-6">
            <HealthScoreGauge score={report.healthScore} grade={report.grade} size={160} />
            <p className="text-xs text-muted-foreground text-center">Overall Health Score</p>
          </div>
        </div>
      </div>

      {/* Sub-score cards */}
      <SubScoreCards subScores={report.subScores} />

      {/* Tab navigation */}
      <div className="border-b border-border no-print">
        <div className="flex gap-1 overflow-x-auto pb-px">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn('tab-btn flex items-center gap-2 whitespace-nowrap', activeTab === id && 'active')}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="animate-fade-in" key={activeTab}>
        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">Language Breakdown</h3>
              <LanguageBreakdown languages={report.languageBreakdown} />
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">
                Most Complex Files
                <span className="ml-2 text-xs font-normal text-muted-foreground">(by size)</span>
              </h3>
              <ComplexityFileList files={report.topComplexFiles} />
            </div>
          </div>
        )}

        {/* COMMITS */}
        {activeTab === 'commits' && (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <ActivityGrid heatmap={report.activityHeatmap} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Commit Score',     value: report.subScores.commits,   color: scoreToColor(report.subScores.commits) },
                { label: 'Weekly Velocity',  value: `${report.subScores.velocity}`,  color: scoreToColor(report.subScores.velocity) },
                { label: 'Bus Factor',       value: report.busFactor,           color: report.busFactor <= 1 ? 'text-red-400' : 'text-emerald-400' },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-card border border-border rounded-xl p-5 text-center">
                  <p className={cn('text-3xl font-bold font-mono', color)}>{value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RISK */}
        {activeTab === 'risk' && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 bg-card border border-border rounded-xl p-5">
              <div className="text-center">
                <p className={cn('text-4xl font-bold font-mono', scoreToColor(100 - report.subScores.risk))}>
                  {report.subScores.risk}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Risk Score</p>
              </div>
              <div className="flex-1 h-px bg-border" />
              <p className="text-sm text-muted-foreground max-w-xs text-right">
                {report.subScores.risk >= 70
                  ? 'High risk — immediate action recommended.'
                  : report.subScores.risk >= 40
                    ? 'Moderate risk — some areas need attention.'
                    : 'Low risk — repository is in good shape.'}
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">Risk Areas</h3>
              <RiskAreasList riskAreas={report.riskAreas} />
            </div>
          </div>
        )}

        {/* CONTRIBUTORS */}
        {activeTab === 'contributors' && (
          <div className="space-y-6">
            <div className="bg-card border border-border rounded-xl p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">Contributor Matrix</h3>
              <ContributorMatrix contributors={report.contributorInsights} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">Developer Profiles</h3>
              <DeveloperInsights contributors={report.contributorInsights} />
            </div>
          </div>
        )}

        {/* RAW DATA */}
        {activeTab === 'raw' && (
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-foreground">Raw Analysis Data</h3>
              <button
                onClick={() => {
                  const blob = new Blob([JSON.stringify(report.rawData, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${report.repoName}-dna-report.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="btn-secondary text-xs gap-1.5"
              >
                Download JSON
              </button>
            </div>
            <pre className="text-xs font-mono text-muted-foreground overflow-auto max-h-[600px] bg-muted/30 rounded-lg p-4 border border-border">
              {JSON.stringify(report.rawData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
