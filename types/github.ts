export interface GithubRepo {
  id: number;
  name: string;
  fullName: string;
  url: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  size: number;
  defaultBranch: string;
  createdAt: string;
  pushedAt: string;
  isPrivate: boolean;
}

export interface GithubCommit {
  sha: string;
  message: string;
  authorLogin: string | null;
  authorEmail: string;
  authorName: string;
  committedAt: string;
  additions: number;
  deletions: number;
}

export interface GithubContributor {
  login: string;
  avatarUrl: string;
  contributions: number;
  htmlUrl: string;
}

export interface GithubTreeEntry {
  path: string;
  type: 'blob' | 'tree';
  size?: number;
  sha: string;
}

export interface GithubTree {
  sha: string;
  truncated: boolean;
  tree: GithubTreeEntry[];
}
