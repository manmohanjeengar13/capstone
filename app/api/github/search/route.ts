import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';
import { requireAuth, getDecryptedGithubToken } from '@/services/auth.service';
import { searchUserRepos } from '@/services/github.service';
import { AppError } from '@/types/api';
import type { ApiResponse } from '@/types/api';

function ok<T>(data: T): NextResponse {
  return NextResponse.json({ data, error: null } satisfies ApiResponse<T>);
}
function err(message: string, status: number): NextResponse {
  return NextResponse.json({ data: null, error: message } satisfies ApiResponse<null>, { status });
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const requestId = uuid();
  try {
    const user = await requireAuth(req);
    const q = new URL(req.url).searchParams.get('q') ?? '';
    if (!q.trim()) {
      const res = ok([]);
      res.headers.set('X-Request-Id', requestId);
      return res;
    }
    const token = (await getDecryptedGithubToken(user)) ?? undefined;
    const repos = await searchUserRepos(q, user.githubLogin ?? '', token);
    const res = ok(repos);
    res.headers.set('X-Request-Id', requestId);
    return res;
  } catch (error) {
    if (error instanceof AppError) return err(error.message, error.statusCode);
    return err('Internal server error', 500);
  }
}
