import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { cacheSet } from '@/lib/redis';
import { logger } from '@/lib/logger';
import {
  getRepoMetadata,
  getLanguages,
  getCommits,
  getFileTree,
  getContributors,
} from '@/services/github.service';
import { analyzeComplexity } from './complexity.analyzer';
import { analyzeCommitPatterns } from './commitPattern.analyzer';
import { analyzeRisk } from './risk.analyzer';
import { analyzeDeveloperBehavior } from './developerBehavior.analyzer';
import { calculateHealthScore } from './healthScore.calculator';

export type ProgressUpdater = (progress: number, step: string) => Promise<void>;

function toJsonValue<T>(value: T): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

/**
 * Full analysis pipeline. Runs all analyzers and saves the report.
 */
export async function runAnalysisPipeline(
  jobId: string,
  repoOwner: string,
  repoName: string,
  githubToken: string,
  updateProgress: ProgressUpdater
): Promise<void> {
  try {
    // Step 1 — Repository metadata
    await updateProgress(5, 'Fetching repository metadata');
    logger.info(`[pipeline] ${jobId} fetching metadata for ${repoOwner}/${repoName}`);
    const [repoMeta, languages] = await Promise.all([
      getRepoMetadata(repoOwner, repoName, githubToken),
      getLanguages(repoOwner, repoName, githubToken),
    ]);

    // Step 2 — File complexity
    await updateProgress(20, 'Analyzing file complexity');
    logger.info(`[pipeline] ${jobId} fetching file tree`);
    const tree = await getFileTree(repoOwner, repoName, repoMeta.defaultBranch, githubToken);
    const complexityResult = analyzeComplexity(tree, languages);

    // Step 3 — Commit patterns
    await updateProgress(45, 'Analyzing commit patterns');
    logger.info(`[pipeline] ${jobId} fetching commits`);
    const commits = await getCommits(repoOwner, repoName, 500, githubToken);
    const commitResult = analyzeCommitPatterns(commits);

    // Step 4 — Risk analysis
    await updateProgress(65, 'Identifying risk areas');
    logger.info(`[pipeline] ${jobId} running risk analysis`);
    const riskResult = analyzeRisk(commits, tree);

    // Step 5 — Developer behavior
    await updateProgress(80, 'Profiling developer behavior');
    logger.info(`[pipeline] ${jobId} profiling contributors`);
    const contributors = await getContributors(repoOwner, repoName, githubToken);
    const behaviorResult = analyzeDeveloperBehavior(commits, contributors);

    // Step 6 — Health score
    await updateProgress(95, 'Calculating health score');
    logger.info(`[pipeline] ${jobId} calculating health score`);
    const healthResult = calculateHealthScore(
      complexityResult.complexityScore,
      commitResult.commitScore,
      riskResult.riskScore,
      commitResult.weeklyVelocity
    );

    // Step 7 — Save report
    await updateProgress(98, 'Saving report');
    logger.info(`[pipeline] ${jobId} saving report to DB`);

    const rawData = {
      repoMeta,
      languages,
      complexityResult,
      commitResult,
      riskResult,
      behaviorResult,
      healthResult,
    };

    const report = await prisma.report.create({
      data: {
        jobId,
        userId: (await prisma.analysisJob.findUnique({ where: { id: jobId } }))!.userId,
        repoUrl: repoMeta.url,
        repoName: repoMeta.name,
        repoOwner: repoMeta.fullName.split('/')[0],
        healthScore: healthResult.healthScore,
        grade: healthResult.grade,
        subScores: toJsonValue(healthResult.subScores),
        busFactor: commitResult.busFactor,
        topComplexFiles: complexityResult.topComplexFiles,
        riskAreas: toJsonValue(riskResult.riskAreas),
        contributors: toJsonValue(behaviorResult.contributorInsights),
        heatmap: toJsonValue(commitResult.activityHeatmap),
        languages,
        summary: healthResult.summary,
        rawData: toJsonValue(rawData),
      },
    });

    // Cache the report
    const dto = {
      id: report.id,
      jobId: report.jobId,
      repoUrl: report.repoUrl,
      repoName: report.repoName,
      repoOwner: report.repoOwner,
      healthScore: report.healthScore,
      grade: report.grade,
      subScores: healthResult.subScores,
      busFactor: report.busFactor,
      topComplexFiles: complexityResult.topComplexFiles,
      riskAreas: riskResult.riskAreas,
      contributorInsights: behaviorResult.contributorInsights,
      activityHeatmap: commitResult.activityHeatmap,
      languageBreakdown: languages,
      summary: report.summary,
      createdAt: report.createdAt.toISOString(),
      rawData,
    };

    await cacheSet(`report:${report.id}`, dto, 3600);

    await prisma.analysisJob.update({
      where: { id: jobId },
      data: { status: 'COMPLETED', progress: 100, currentStep: 'Analysis complete' },
    });

    logger.info(`[pipeline] ${jobId} completed successfully → report ${report.id}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    logger.error(`[pipeline] ${jobId} failed: ${message}`);

    await prisma.analysisJob.update({
      where: { id: jobId },
      data: { status: 'FAILED', errorMsg: message },
    });

    throw err;
  }
}
