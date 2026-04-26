import type { GithubCommit } from '@/types/github';
import type { ActivityHeatmap } from '@/types/report';
import { clamp } from '@/lib/utils';

export interface CommitPatternResult {
  commitScore: number;
  weeklyVelocity: number;
  busFactor: number;
  activityHeatmap: ActivityHeatmap;
  burnoutSignal: number;
  commitHygieneScore: number;
  gaps: string[];
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Analyze commit history for patterns, velocity, burnout signals and hygiene.
 */
export function analyzeCommitPatterns(commits: GithubCommit[]): CommitPatternResult {
  if (commits.length === 0) {
    const emptyGrid: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
    return {
      commitScore: 0,
      weeklyVelocity: 0,
      busFactor: 0,
      activityHeatmap: { grid: emptyGrid, peakDay: 0, peakHour: 0 },
      burnoutSignal: 0,
      commitHygieneScore: 0,
      gaps: [],
    };
  }

  // Sort ascending
  const sorted = [...commits].sort(
    (a, b) => new Date(a.committedAt).getTime() - new Date(b.committedAt).getTime()
  );

  // Build 7×24 activity heatmap
  const grid: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
  let weekendCount = 0;
  let afterHoursCount = 0;

  for (const c of sorted) {
    const d = new Date(c.committedAt);
    const day = d.getUTCDay();
    const hour = d.getUTCHours();
    grid[day][hour]++;
    if (day === 0 || day === 6) weekendCount++;
    if (hour >= 20 || hour < 6) afterHoursCount++;
  }

  // Peak cell
  let peakDay = 0, peakHour = 0, peakVal = 0;
  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      if (grid[d][h] > peakVal) {
        peakVal = grid[d][h];
        peakDay = d;
        peakHour = h;
      }
    }
  }

  // Burnout signal
  const burnoutSignal = Math.round(
    ((weekendCount + afterHoursCount) / (commits.length * 2)) * 100
  );

  // Weekly velocity (last 12 weeks)
  const twelveWeeksAgo = Date.now() - 12 * 7 * 24 * 60 * 60 * 1000;
  const recentCommits = commits.filter(
    (c) => new Date(c.committedAt).getTime() >= twelveWeeksAgo
  );
  const weeklyVelocity = Math.round(recentCommits.length / 12);

  // Bus factor: how many authors cover ≥ 80% of commits
  const authorCounts: Record<string, number> = {};
  for (const c of commits) {
    const author = c.authorLogin ?? c.authorEmail ?? 'unknown';
    authorCounts[author] = (authorCounts[author] ?? 0) + 1;
  }
  const sortedAuthors = Object.values(authorCounts).sort((a, b) => b - a);
  const total = commits.length;
  let cumulative = 0;
  let busFactor = 0;
  for (const count of sortedAuthors) {
    cumulative += count;
    busFactor++;
    if (cumulative / total >= 0.8) break;
  }

  // Commit hygiene
  const badMessages = commits.filter((c) => c.message.trim().length < 10).length;
  const commitHygieneScore = Math.round((1 - badMessages / commits.length) * 100);

  // Gaps > 30 days
  const gaps: string[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1].committedAt).getTime();
    const curr = new Date(sorted[i].committedAt).getTime();
    const days = Math.floor((curr - prev) / (1000 * 60 * 60 * 24));
    if (days > 30) {
      gaps.push(
        `${days}-day gap between ${formatDate(sorted[i - 1].committedAt)} and ${formatDate(sorted[i].committedAt)}`
      );
    }
  }

  // Composite commit score
  const velocityScore = Math.min(weeklyVelocity * 10, 100);
  const burnoutPenalty = Math.min(burnoutSignal * 0.3, 30);
  const gapPenalty = Math.min(gaps.length * 5, 20);
  const commitScore = clamp(
    velocityScore * 0.4 + commitHygieneScore * 0.4 - burnoutPenalty - gapPenalty,
    0,
    100
  );

  return {
    commitScore: Math.round(commitScore),
    weeklyVelocity,
    busFactor,
    activityHeatmap: { grid, peakDay, peakHour },
    burnoutSignal,
    commitHygieneScore,
    gaps,
  };
}
