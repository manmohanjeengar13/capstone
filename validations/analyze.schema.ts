import { z } from 'zod';

export const repoUrlSchema = z.object({
  repoUrl: z
    .string()
    .min(1, 'Repository URL is required')
    .url('Must be a valid URL')
    .refine(
      (url) => /^https:\/\/github\.com\/[^/]+\/[^/]+/.test(url),
      { message: 'Must be a GitHub URL: https://github.com/owner/repo' }
    ),
});

export type RepoUrlInput = z.infer<typeof repoUrlSchema>;
