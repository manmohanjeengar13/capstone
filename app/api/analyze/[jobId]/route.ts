import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';
import { requireAuth } from '@/services/auth.service';
import { getJobProgress } from '@/services/analyze.service';
import { AppError } from '@/types/api';
import type { ApiResponse } from '@/types/api';

function ok<T>(data: T): NextResponse {
  return NextResponse.json({ data, error: null } satisfies ApiResponse<T>);
}
function err(message: string, status: number): NextResponse {
  return NextResponse.json({ data: null, error: message } satisfies ApiResponse<null>, { status });
}

export async function GET(
  req: NextRequest,
  { params }: { params: { jobId: string } }
): Promise<NextResponse> {
  const requestId = uuid();
  try {
    const user = await requireAuth(req);
    const progress = await getJobProgress(params.jobId, user.id);
    const res = ok(progress);
    res.headers.set('X-Request-Id', requestId);
    return res;
  } catch (error) {
    if (error instanceof AppError) {
      return err(error.message, error.statusCode);
    }
    return err('Internal server error', 500);
  }
}
