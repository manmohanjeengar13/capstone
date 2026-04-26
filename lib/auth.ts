import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from '@/lib/prisma';
import { encrypt } from '@/lib/crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!;

/**
 * Server-side Better Auth instance.
 * Attempts to persist the GitHub OAuth token on login, while API routes also
 * support backfilling it from the linked account row for existing users.
 */
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
  provider: 'postgresql'   
}),
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.NEXT_PUBLIC_APP_URL!,
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      scope: ['read:user', 'user:email', 'repo'],
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  callbacks: {
    async onOAuthSuccess({
      user,
      account,
    }: {
      user: { id: string; name?: string | null; image?: string | null };
      account: { provider?: string; providerId?: string; accessToken?: string };
    }) {
      const provider = account.providerId ?? account.provider;
      if (provider === 'github' && account.accessToken) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            githubToken: encrypt(account.accessToken, ENCRYPTION_KEY),
            githubLogin: user.name ?? undefined,
            avatarUrl: user.image ?? undefined,
          },
        });
      }
    },
  },
  session: { expiresIn: 30 * 24 * 60 * 60 },
});
