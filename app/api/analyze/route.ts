import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';
import { requireAuth, getDecryptedGithubToken } from '@/services/auth.service';
import { createAndEnqueueJob } from '@/services/analyze.service';
import { checkRateLimit } from '@/lib/rateLimit';
import { repoUrlSchema } from '@/validations/analyze.schema';
import { AppError } from '@/types/api';
import type { ApiResponse } from '@/types/api';

function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json({ data, error: null } satisfies ApiResponse<T>, { status });
}

function err(message: string, status: number, requestId: string): NextResponse {
  return NextResponse.json(
    { data: null, error: message } satisfies ApiResponse<null>,
    { status, headers: { 'X-Request-Id': requestId } }
  );
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const requestId = uuid();

  try {
    const user = await requireAuth(req);
    const token = await getDecryptedGithubToken(user);
    if (!token) {
      return err('GitHub token not found. Please reconnect your GitHub account.', 400, requestId);
    }

    // Rate limit: 5 analyses per hour per user
    const { allowed, retryAfter } = await checkRateLimit(
      `ratelimit:analyze:${user.id}`,
      5,
      3600
    );
    if (!allowed) {
      return NextResponse.json(
        { data: null, error: `Rate limit exceeded. Try again in ${retryAfter} seconds.` },
        {
          status: 429,
          headers: {
            'X-Request-Id': requestId,
            'Retry-After': String(retryAfter),
          },
        }
      );
    }

    const body = await req.json();
    const parsed = repoUrlSchema.safeParse(body);
    if (!parsed.success) {
      return err(parsed.error.errors[0].message, 400, requestId);
    }

    const jobId = await createAndEnqueueJob(parsed.data.repoUrl, user, token);

    const res = ok({ jobId, status: 'PENDING' }, 202);
    res.headers.set('X-Request-Id', requestId);
    return res;
  } catch (error) {
    if (error instanceof AppError) {
      return err(error.message, error.statusCode, requestId);
    }
    console.error('[POST /api/analyze]', error);
    return err('Internal server error', 500, requestId);
  }
}
