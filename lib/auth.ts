import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { prisma } from '@/lib/prisma';
import { encrypt } from '@/lib/crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!;

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.NEXT_PUBLIC_APP_URL!,
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      scope: ['read:user', 'user:email', 'repo'],
      // Map GitHub profile fields onto our custom user columns at sign-up
      mapProfileToUser: (profile: Record<string, unknown>) => ({
        githubLogin: (profile.login as string) ?? null,
        avatarUrl: (profile.avatar_url as string) ?? null,
      }),
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  // Capture the GitHub access token the moment the OAuth account row is created
  databaseHooks: {
    account: {
      create: {
        after: async (account) => {
          if (account.providerId === 'github' && account.accessToken) {
            await prisma.user.update({
              where: { id: account.userId },
              data: {
                githubToken: encrypt(account.accessToken, ENCRYPTION_KEY),
              },
            });
          }
        },
      },
      // Also refresh the token on subsequent sign-ins (token rotation)
      update: {
        after: async (account) => {
          // account may be a count (better-auth bug) so guard carefully
          if (
            account &&
            typeof account === 'object' &&
            'providerId' in account &&
            account.providerId === 'github' &&
            'accessToken' in account &&
            account.accessToken
          ) {
            await prisma.user.update({
              where: { id: account.userId as string },
              data: {
                githubToken: encrypt(account.accessToken as string, ENCRYPTION_KEY),
              },
            }).catch(() => {
              // Non-fatal — token will be backfilled from account row on next request
            });
          }
        },
      },
    },
  },
  session: { expiresIn: 30 * 24 * 60 * 60 },
});