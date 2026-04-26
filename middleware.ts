import { NextRequest, NextResponse } from 'next/server';

const PROTECTED_PREFIXES = ['/dashboard', '/analyze', '/reports'];

export function middleware(req: NextRequest): NextResponse {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));

  if (isProtected) {
    const token =
      req.cookies.get('better-auth.session_token')?.value ??
      req.cookies.get('better-auth.session-token')?.value ??
      req.cookies.get('__session')?.value ??
      null;

    if (!token) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('from', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect authenticated users away from login
  if (pathname === '/login') {
    const token =
      req.cookies.get('better-auth.session_token')?.value ??
      req.cookies.get('better-auth.session-token')?.value ??
      req.cookies.get('__session')?.value ??
      null;
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/analyze/:path*', '/reports/:path*', '/login'],
};
