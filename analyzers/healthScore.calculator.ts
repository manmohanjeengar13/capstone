import type { HealthGrade, SubScores } from '@/types/report';
import { clamp } from '@/lib/utils';

export interface HealthScoreResult {
  healthScore: number;
  grade: HealthGrade;
  summary: string;
  subScores: SubScores;
}

function scoreToGrade(score: number): HealthGrade {
  if (score >= 90) return 'A';
  if (score >= 75) return 'B';
  if (score >= 60) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

function buildSummary(
  complexityScore: number,
  commitScore: number,
  riskScore: number,
  velocityScore: number,
  healthScore: number,
  grade: HealthGrade
): string {
  const scores = [
    { name: 'complexity', value: complexityScore },
    { name: 'commit hygiene', value: commitScore },
    { name: 'risk management', value: 100 - riskScore },
    { name: 'development velocity', value: velocityScore },
  ];
  const weakest = scores.reduce((a, b) => (a.value < b.value ? a : b));
  const riskNote =
    riskScore > 60
      ? ' Critical risk areas require immediate attention.'
      : riskScore > 40
        ? ' Some risk areas should be monitored.'
        : ' Risk profile is acceptable.';

  const gradeDesc: Record<HealthGrade, string> = {
    A: 'excellent',
    B: 'good',
    C: 'moderate',
    D: 'poor',
    F: 'critical',
  };

  return (
    `This repository has ${gradeDesc[grade]} overall health with a score of ${healthScore}/100 (Grade ${grade}). ` +
    `The weakest dimension is ${weakest.name} (${Math.round(weakest.value)}/100), which represents the primary area for improvement.` +
    riskNote
  );
}

/**
 * Calculate overall health score from sub-scores.
 * Formula: complexity*0.25 + commits*0.25 + (100-risk)*0.30 + velocity*0.20
 */
export function calculateHealthScore(
  complexityScore: number,
  commitScore: number,
  riskScore: number,
  weeklyVelocity: number
): HealthScoreResult {
  const velocityScore = clamp(weeklyVelocity * 10, 0, 100);

  const healthScore = Math.round(
    complexityScore * 0.25 +
      commitScore * 0.25 +
      (100 - riskScore) * 0.3 +
      velocityScore * 0.2
  );

  const grade = scoreToGrade(healthScore);

  const subScores: SubScores = {
    complexity: Math.round(complexityScore),
    commits: Math.round(commitScore),
    risk: Math.round(riskScore),
    velocity: Math.round(velocityScore),
  };

  const summary = buildSummary(complexityScore, commitScore, riskScore, velocityScore, healthScore, grade);

  return { healthScore: clamp(healthScore, 0, 100), grade, summary, subScores };
}
