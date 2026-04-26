import { Octokit } from '@octokit/rest';

/**
 * Create an authenticated Octokit instance for a given user token.
 * If no token is provided, creates an unauthenticated instance (rate-limited).
 */
export function createOctokit(token?: string): Octokit {
  return new Octokit({
    auth: token,
    userAgent: 'dna-analyzer/1.0.0',
    throttle: {
      onRateLimit: (retryAfter: number, options: { method: string; url: string }) => {
        console.warn(`Rate limit hit for ${options.method} ${options.url}. Retrying after ${retryAfter}s`);
        return true;
      },
      onSecondaryRateLimit: (_retryAfter: number, options: { method: string; url: string }) => {
        console.warn(`Secondary rate limit hit for ${options.method} ${options.url}`);
        return false;
      },
    },
  });
}
