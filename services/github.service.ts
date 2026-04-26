import { createOctokit } from '@/lib/octokit';
import type { GithubRepo, GithubCommit, GithubContributor, GithubTree } from '@/types/github';
import { AppError } from '@/types/api';

/**
 * Fetch repository metadata.
 */
export async function getRepoMetadata(
  owner: string,
  repo: string,
  token?: string
): Promise<GithubRepo> {
  const octokit = createOctokit(token);
  try {
    const { data } = await octokit.repos.get({ owner, repo });
    return {
      id: data.id,
      name: data.name,
      fullName: data.full_name,
      url: data.html_url,
      description: data.description,
      language: data.language ?? null,
      stars: data.stargazers_count,
      forks: data.forks_count,
      size: data.size,
      defaultBranch: data.default_branch,
      createdAt: data.created_at ?? new Date().toISOString(),
      pushedAt: data.pushed_at ?? new Date().toISOString(),
      isPrivate: data.private,
    };
  } catch (err: unknown) {
    const e = err as { status?: number };
    if (e?.status === 404) throw new AppError(`Repository ${owner}/${repo} not found`, 404);
    if (e?.status === 403) throw new AppError('GitHub API rate limit exceeded', 429);
    throw new AppError('Failed to fetch repository metadata', 500);
  }
}

/**
 * Fetch language breakdown bytes.
 */
export async function getLanguages(
  owner: string,
  repo: string,
  token?: string
): Promise<Record<string, number>> {
  const octokit = createOctokit(token);
  const { data } = await octokit.repos.listLanguages({ owner, repo });
  return data as Record<string, number>;
}

/**
 * Fetch up to `max` commits (paginated, 100/page).
 */
export async function getCommits(
  owner: string,
  repo: string,
  max = 500,
  token?: string
): Promise<GithubCommit[]> {
  const octokit = createOctokit(token);
  const commits: GithubCommit[] = [];
  let page = 1;

  while (commits.length < max) {
    const perPage = Math.min(100, max - commits.length);
    const { data } = await octokit.repos.listCommits({
      owner,
      repo,
      per_page: perPage,
      page,
    });

    if (data.length === 0) break;

    for (const c of data) {
      commits.push({
        sha: c.sha,
        message: c.commit.message,
        authorLogin: c.author?.login ?? null,
        authorEmail: c.commit.author?.email ?? '',
        authorName: c.commit.author?.name ?? '',
        committedAt: c.commit.author?.date ?? new Date().toISOString(),
        additions: 0,
        deletions: 0,
      });
    }

    if (data.length < perPage) break;
    page++;
  }

  return commits;
}

/**
 * Fetch the recursive git tree for a branch.
 */
export async function getFileTree(
  owner: string,
  repo: string,
  treeSha: string,
  token?: string
): Promise<GithubTree> {
  const octokit = createOctokit(token);
  const { data } = await octokit.git.getTree({
    owner,
    repo,
    tree_sha: treeSha,
    recursive: '1',
  });

  return {
    sha: data.sha,
    truncated: data.truncated ?? false,
    tree: (data.tree ?? []).map((entry) => ({
      path: entry.path ?? '',
      type: (entry.type as 'blob' | 'tree') ?? 'blob',
      size: entry.size ?? 0,
      sha: entry.sha ?? '',
    })),
  };
}

/**
 * Fetch top contributors.
 */
export async function getContributors(
  owner: string,
  repo: string,
  token?: string
): Promise<GithubContributor[]> {
  const octokit = createOctokit(token);
  try {
    const { data } = await octokit.repos.listContributors({
      owner,
      repo,
      per_page: 100,
    });
    return (data ?? []).map((c) => ({
      login: c.login ?? 'unknown',
      avatarUrl: c.avatar_url ?? '',
      contributions: c.contributions ?? 0,
      htmlUrl: c.html_url ?? '',
    }));
  } catch {
    return [];
  }
}

/**
 * Search repositories matching a query string for a user.
 */
export async function searchUserRepos(
  query: string,
  login: string,
  token?: string
): Promise<GithubRepo[]> {
  const octokit = createOctokit(token);
  const q = login ? `${query} user:${login}` : query;
  try {
    const { data } = await octokit.search.repos({
      q,
      per_page: 10,
      sort: 'updated',
    });
    return data.items.map((r) => ({
      id: r.id,
      name: r.name,
      fullName: r.full_name,
      url: r.html_url,
      description: r.description ?? null,
      language: r.language ?? null,
      stars: r.stargazers_count,
      forks: r.forks_count,
      size: r.size,
      defaultBranch: r.default_branch,
      createdAt: r.created_at ?? new Date().toISOString(),
      pushedAt: r.pushed_at ?? new Date().toISOString(),
      isPrivate: r.private,
    }));
  } catch {
    return [];
  }
}
