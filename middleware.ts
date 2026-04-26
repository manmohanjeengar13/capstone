import { NextRequest, NextResponse } from 'next/server';

const PROTECTED_PREFIXES = ['/dashboard', '/analyze', '/reports'];

// better-auth uses different cookie names depending on environment
// On HTTPS (Vercel), cookies get the __Secure- prefix automatically
function getSessionToken(req: NextRequest): string | null {
  return (
    req.cookies.get('__Secure-better-auth.session_token')?.value ??
    req.cookies.get('__Secure-better-auth.session-token')?.value ??
    req.cookies.get('better-auth.session_token')?.value ??
    req.cookies.get('better-auth.session-token')?.value ??
    req.cookies.get('__session')?.value ??
    null
  );
}

export function middleware(req: NextRequest): NextResponse {
  const { pathname } = req.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const token = getSessionToken(req);

  if (isProtected && !token) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/analyze/:path*', '/reports/:path*', '/login'],
};