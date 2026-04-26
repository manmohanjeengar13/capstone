import type { GithubCommit } from '@/types/github';
import type { GithubTree } from '@/types/github';
import type { RiskArea, RiskSeverity } from '@/types/report';
import { clamp } from '@/lib/utils';

export interface RiskResult {
  riskScore: number;      // 0–100, higher = riskier
  riskAreas: RiskArea[];
}

const TODO_REGEX = /\b(TODO|FIXME|HACK|XXX|BUG|WORKAROUND)\b/i;
const LOCKFILES = ['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'bun.lockb'];
const PACKAGE_JSON_NAMES = ['package.json'];

/**
 * Analyze commit history and file tree for risk signals.
 */
export function analyzeRisk(commits: GithubCommit[], tree: GithubTree): RiskResult {
  const riskAreas: RiskArea[] = [];
  let riskScore = 0;

  const paths = new Set(tree.tree.map((e) => e.path));
  const now = Date.now();

  // ── 1. Staleness ──────────────────────────────────────────────────────────
  if (commits.length > 0) {
    const lastCommit = commits.reduce((latest, c) =>
      new Date(c.committedAt) > new Date(latest.committedAt) ? c : latest
    );
    const daysSinceLast = Math.floor(
      (now - new Date(lastCommit.committedAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLast > 365) {
      riskScore += 25;
      riskAreas.push({
        file: 'repository',
        severity: 'CRITICAL',
        reason: `No commits in over a year (${daysSinceLast} days). Repository may be abandoned.`,
        metric: `Last commit: ${daysSinceLast} days ago`,
      });
    } else if (daysSinceLast > 90) {
      riskScore += 15;
      riskAreas.push({
        file: 'repository',
        severity: 'HIGH',
        reason: `Repository has been inactive for ${daysSinceLast} days.`,
        metric: `Last commit: ${daysSinceLast} days ago`,
      });
    }
  }

  // ── 2. Missing lockfile ────────────────────────────────────────────────────
  const hasPackageJson = PACKAGE_JSON_NAMES.some((f) => paths.has(f));
  const hasLockfile = LOCKFILES.some((f) => paths.has(f));
  if (hasPackageJson && !hasLockfile) {
    riskScore += 20;
    riskAreas.push({
      file: 'package.json',
      severity: 'HIGH',
      reason: 'package.json found but no lockfile detected. Dependency versions are non-deterministic.',
      metric: 'Missing: package-lock.json / yarn.lock / pnpm-lock.yaml',
    });
  }

  // ── 3. TODO / FIXME density ───────────────────────────────────────────────
  if (commits.length > 0) {
    const todoCount = commits.filter((c) => TODO_REGEX.test(c.message)).length;
    const todoRatio = todoCount / commits.length;
    if (todoRatio > 0.2) {
      riskScore += 20;
      riskAreas.push({
        file: 'commit history',
        severity: 'HIGH',
        reason: `${Math.round(todoRatio * 100)}% of commits reference TODO/FIXME/HACK. High technical debt signals.`,
        metric: `${todoCount}/${commits.length} commits contain debt keywords`,
      });
    } else if (todoRatio > 0.1) {
      riskScore += 10;
      riskAreas.push({
        file: 'commit history',
        severity: 'MEDIUM',
        reason: `${Math.round(todoRatio * 100)}% of commits reference TODO/FIXME. Moderate technical debt.`,
        metric: `${todoCount}/${commits.length} commits contain debt keywords`,
      });
    } else if (todoRatio > 0.05) {
      riskScore += 5;
      riskAreas.push({
        file: 'commit history',
        severity: 'LOW',
        reason: 'Some commits reference TODO/FIXME items.',
        metric: `${todoCount}/${commits.length} commits contain debt keywords`,
      });
    }
  }

  // ── 4. High-churn files heuristic ─────────────────────────────────────────
  // Extract file paths mentioned in commit messages
  const fileMentions: Record<string, number> = {};
  const filePathRegex = /[\w/-]+\.\w{2,5}/g;
  for (const c of commits) {
    const matches = c.message.match(filePathRegex) ?? [];
    for (const f of matches) {
      fileMentions[f] = (fileMentions[f] ?? 0) + 1;
    }
  }
  const highChurnThreshold = commits.length * 0.3;
  const highChurnFiles = Object.entries(fileMentions)
    .filter(([, count]) => count >= highChurnThreshold)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  for (const [file, count] of highChurnFiles) {
    const severity: RiskSeverity = count > commits.length * 0.5 ? 'HIGH' : 'MEDIUM';
    riskScore += severity === 'HIGH' ? 10 : 5;
    riskAreas.push({
      file,
      severity,
      reason: `File referenced in ${Math.round((count / commits.length) * 100)}% of commits, indicating high churn.`,
      metric: `Mentioned in ${count} commits`,
    });
  }

  // ── 5. Security-sensitive files exposed ──────────────────────────────────
  const sensitivePatterns = ['.env', 'id_rsa', 'private.key', 'credentials.json', '.pem'];
  for (const pattern of sensitivePatterns) {
    const found = tree.tree.find((e) => e.path.includes(pattern));
    if (found) {
      riskScore += 30;
      riskAreas.push({
        file: found.path,
        severity: 'CRITICAL',
        reason: 'Potentially sensitive file detected in repository tree.',
        metric: `File: ${found.path}`,
      });
    }
  }

  return {
    riskScore: clamp(riskScore, 0, 100),
    riskAreas,
  };
}
