import type { GithubCommit, GithubContributor } from '@/types/github';
import type { ContributorInsight } from '@/types/report';

export interface DeveloperBehaviorResult {
  contributorInsights: ContributorInsight[];
  teamHealthSignals: string[];
}

const GHOST_THRESHOLD_DAYS = 90;

/**
 * Analyze developer behavior and team health from commits and contributors.
 */
export function analyzeDeveloperBehavior(
  commits: GithubCommit[],
  contributors: GithubContributor[]
): DeveloperBehaviorResult {
  const now = Date.now();

  // Group commits by author
  const commitsByAuthor: Record<string, GithubCommit[]> = {};
  for (const c of commits) {
    const key = c.authorLogin ?? c.authorEmail ?? 'unknown';
    if (!commitsByAuthor[key]) commitsByAuthor[key] = [];
    commitsByAuthor[key].push(c);
  }

  const totalCommits = commits.length || 1;

  // Build contributor insights (top 10)
  const topKeys = Object.entries(commitsByAuthor)
    .sort(([, a], [, b]) => b.length - a.length)
    .slice(0, 10)
    .map(([key]) => key);

  const contributorInsights: ContributorInsight[] = topKeys.map((key) => {
    const authorCommits = commitsByAuthor[key];
    const commitCount = authorCommits.length;

    const lastCommit = authorCommits.reduce((latest, c) =>
      new Date(c.committedAt) > new Date(latest.committedAt) ? c : latest
    );
    const lastActiveAt = lastCommit.committedAt;
    const daysSinceActive = Math.floor(
      (now - new Date(lastActiveAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    const isGhost = daysSinceActive > GHOST_THRESHOLD_DAYS;

    const linesAdded = authorCommits.reduce((sum, c) => sum + (c.additions ?? 0), 0);
    const linesDeleted = authorCommits.reduce((sum, c) => sum + (c.deletions ?? 0), 0);
    const churnRatio = parseFloat((linesDeleted / Math.max(linesAdded, 1)).toFixed(2));

    const ownershipPercent = parseFloat(((commitCount / totalCommits) * 100).toFixed(2));

    // Try to find avatar from contributors list
    const ghContributor = contributors.find((c) => c.login === key);
    const avatarUrl = ghContributor?.avatarUrl ?? `https://avatars.githubusercontent.com/u/0?s=40`;

    return {
      login: key,
      avatarUrl,
      commitCount,
      linesAdded,
      linesDeleted,
      churnRatio,
      lastActiveAt,
      isGhost,
      ownershipPercent,
    };
  });

  // Team health signals
  const teamHealthSignals: string[] = [];

  const ghosts = contributorInsights.filter((c) => c.isGhost);
  if (ghosts.length > 0) {
    teamHealthSignals.push(
      `${ghosts.length} contributor${ghosts.length > 1 ? 's' : ''} (${ghosts.map((g) => g.login).join(', ')}) have been inactive for 90+ days.`
    );
  }

  const topOwner = contributorInsights[0];
  if (topOwner && topOwner.ownershipPercent > 60) {
    teamHealthSignals.push(
      `${topOwner.login} owns ${topOwner.ownershipPercent}% of all commits — high bus-factor risk.`
    );
  }

  const highChurn = contributorInsights.filter((c) => c.churnRatio > 2.0);
  if (highChurn.length > 0) {
    teamHealthSignals.push(
      `${highChurn.map((c) => c.login).join(', ')} show high code churn (rewrites), suggesting instability or refactoring cycles.`
    );
  }

  if (contributorInsights.length === 1) {
    teamHealthSignals.push('Single contributor detected. This repository has a bus factor of 1.');
  }

  const activeCount = contributorInsights.filter((c) => !c.isGhost).length;
  if (activeCount >= 5) {
    teamHealthSignals.push(`Healthy team: ${activeCount} active contributors in the last 90 days.`);
  }

  return { contributorInsights, teamHealthSignals };
}
