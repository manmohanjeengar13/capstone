import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';
import { requireAuth } from '@/services/auth.service';
import { listReports } from '@/services/reports.service';
import { paginationSchema } from '@/validations/common.schema';
import { AppError } from '@/types/api';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const requestId = uuid();
  try {
    const user = await requireAuth(req);

    const { searchParams } = new URL(req.url);
    const parsed = paginationSchema.safeParse({
      page: searchParams.get('page') ?? '1',
      limit: searchParams.get('limit') ?? '10',
      sort: searchParams.get('sort') ?? 'createdAt_desc',
    });

    if (!parsed.success) {
      return NextResponse.json(
        { data: null, error: parsed.error.errors[0].message },
        { status: 400, headers: { 'X-Request-Id': requestId } }
      );
    }

    const result = await listReports(
      user.id,
      parsed.data.page,
      parsed.data.limit,
      parsed.data.sort
    );

    return NextResponse.json(result, {
      headers: { 'X-Request-Id': requestId },
    });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { data: null, error: error.message },
        { status: error.statusCode, headers: { 'X-Request-Id': requestId } }
      );
    }
    return NextResponse.json(
      { data: null, error: 'Internal server error' },
      { status: 500, headers: { 'X-Request-Id': requestId } }
    );
  }
}
