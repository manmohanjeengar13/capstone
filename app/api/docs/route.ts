import { NextResponse } from 'next/server';
import { swaggerSpec } from '@/lib/swagger';

/**
 * GET /api/docs
 * Returns the OpenAPI 3.0 JSON specification.
 * Used by the /docs page to render Swagger UI.
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(swaggerSpec, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
