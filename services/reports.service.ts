import { prisma } from '@/lib/prisma';
import { cacheGet, cacheSet, cacheDel } from '@/lib/redis';
import { AppError } from '@/types/api';
import type { PaginatedResponse } from '@/types/api';
import type { Report } from '@/types/report';

type SortField = 'createdAt' | 'healthScore';
type SortDir = 'asc' | 'desc';

function parseSort(sort: string): { field: SortField; dir: SortDir } {
  const [field, dir] = sort.split('_');
  return {
    field: (field as SortField) ?? 'createdAt',
    dir: (dir as SortDir) ?? 'desc',
  };
}

function mapReport(r: Record<string, unknown>): Report {
  return {
    id: r.id as string,
    jobId: r.jobId as string,
    repoUrl: r.repoUrl as string,
    repoName: r.repoName as string,
    repoOwner: r.repoOwner as string,
    healthScore: r.healthScore as number,
    grade: r.grade as Report['grade'],
    subScores: r.subScores as Report['subScores'],
    busFactor: r.busFactor as number,
    topComplexFiles: r.topComplexFiles as string[],
    riskAreas: r.riskAreas as Report['riskAreas'],
    contributorInsights: r.contributors as Report['contributorInsights'],
    activityHeatmap: r.heatmap as Report['activityHeatmap'],
    languageBreakdown: r.languages as Record<string, number>,
    summary: r.summary as string,
    createdAt: (r.createdAt as Date).toISOString(),
  };
}

/**
 * Paginated list of reports for a user (excludes rawData).
 */
export async function listReports(
  userId: string,
  page: number,
  limit: number,
  sort: string
): Promise<PaginatedResponse<Report>> {
  const { field, dir } = parseSort(sort);
  const skip = (page - 1) * limit;

  const [rows, total] = await Promise.all([
    prisma.report.findMany({
      where: { userId, deletedAt: null },
      orderBy: { [field]: dir },
      skip,
      take: limit,
      select: {
        id: true,
        jobId: true,
        repoUrl: true,
        repoName: true,
        repoOwner: true,
        healthScore: true,
        grade: true,
        subScores: true,
        busFactor: true,
        topComplexFiles: true,
        riskAreas: true,
        contributors: true,
        heatmap: true,
        languages: true,
        summary: true,
        createdAt: true,
      },
    }),
    prisma.report.count({ where: { userId, deletedAt: null } }),
  ]);

  return {
    data: rows.map(mapReport),
    total,
    page,
    limit,
    hasMore: skip + rows.length < total,
  };
}

/**
 * Get a single report by id. Checks Redis cache first.
 */
export async function getReport(
  id: string,
  userId: string
): Promise<Report & { rawData: unknown }> {
  const cacheKey = `report:${id}`;

  const cached = await cacheGet<Report & { rawData: unknown }>(cacheKey);
  if (cached) return cached;

  const row = await prisma.report.findFirst({
    where: { id, userId, deletedAt: null },
  });

  if (!row) throw new AppError('Report not found', 404);

  const report: Report & { rawData: unknown } = {
    ...mapReport(row as unknown as Record<string, unknown>),
    rawData: row.rawData,
  };

  await cacheSet(cacheKey, report, 3600);
  return report;
}

/**
 * Soft-delete a report (sets deletedAt). Invalidates cache.
 */
export async function softDeleteReport(id: string, userId: string): Promise<void> {
  const existing = await prisma.report.findFirst({
    where: { id, userId, deletedAt: null },
  });
  if (!existing) throw new AppError('Report not found', 404);

  await prisma.report.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  await cacheDel(`report:${id}`);
}
