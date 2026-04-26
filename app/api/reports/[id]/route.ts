import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';
import { requireAuth } from '@/services/auth.service';
import { getReport, softDeleteReport } from '@/services/reports.service';
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

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const requestId = uuid();
  try {
    const user = await requireAuth(req);
    const report = await getReport(params.id, user.id);
    const res = ok(report);
    res.headers.set('X-Request-Id', requestId);
    return res;
  } catch (error) {
    if (error instanceof AppError) return err(error.message, error.statusCode, requestId);
    return err('Internal server error', 500, requestId);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const requestId = uuid();
  try {
    const user = await requireAuth(req);
    await softDeleteReport(params.id, user.id);
    const res = ok({ deleted: true });
    res.headers.set('X-Request-Id', requestId);
    return res;
  } catch (error) {
    if (error instanceof AppError) return err(error.message, error.statusCode, requestId);
    return err('Internal server error', 500, requestId);
  }
}
