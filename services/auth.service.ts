import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { decrypt, encrypt } from '@/lib/crypto';
import { AppError } from '@/types/api';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!;

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  githubToken: string | null;
  githubLogin: string | null;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Extract session token from cookie or Authorization header.
 */
function extractSessionId(req: NextRequest): string | null {
  const cookie =
    req.cookies.get('better-auth.session_token')?.value ??
    req.cookies.get('better-auth.session-token')?.value ??
    req.cookies.get('__session')?.value ??
    null;
  if (cookie) return cookie.split('.')[0] ?? null;

  const auth = req.headers.get('authorization');
  if (auth?.startsWith('Bearer ')) return auth.slice(7);

  return null;
}

/**
 * Resolve session token → User. Returns null if invalid/expired.
 */
export async function getSessionFromRequest(req: NextRequest): Promise<AuthUser | null> {
  const sessionId = extractSessionId(req);
  if (!sessionId) return null;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
          githubToken: true,
          githubLogin: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  if (!session) return null;
  if (session.expiresAt < new Date()) return null;

  return session.user;
}

/**
 * Resolve the user's GitHub access token. If the encrypted copy is missing,
 * fall back to the linked Better Auth account row and backfill user.githubToken.
 */
export async function getDecryptedGithubToken(user: AuthUser): Promise<string | null> {
  if (user.githubToken) {
    try {
      return decrypt(user.githubToken, ENCRYPTION_KEY);
    } catch {
      return null;
    }
  }

  const account = await prisma.account.findFirst({
    where: {
      userId: user.id,
      providerId: 'github',
      accessToken: { not: null },
    },
    orderBy: { updatedAt: 'desc' },
  });

  if (!account?.accessToken) return null;

  const encryptedToken = encrypt(account.accessToken, ENCRYPTION_KEY);
  await prisma.user.update({
    where: { id: user.id },
    data: { githubToken: encryptedToken },
  });

  user.githubToken = encryptedToken;
  return account.accessToken;
}

/**
 * Require authentication. Throws AppError(401) if no valid session.
 */
export async function requireAuth(req: NextRequest): Promise<AuthUser> {
  const user = await getSessionFromRequest(req);
  if (!user) {
    throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
  }
  return user;
}
