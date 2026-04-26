import type { GithubTree } from '@/types/github';
import { clamp } from '@/lib/utils';

export interface ComplexityResult {
  complexityScore: number;       // 0–100 (100 = least complex)
  topComplexFiles: string[];     // top 10 largest code files by byte size
  totalFiles: number;
}

const CODE_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.py', '.java', '.go', '.rs',
  '.cpp', '.c', '.cs', '.php', '.rb', '.swift', '.kt', '.vue',
  '.scala', '.r', '.ex', '.exs', '.clj', '.hs', '.ml',
]);

function getExtension(path: string): string {
  const dot = path.lastIndexOf('.');
  return dot !== -1 ? path.slice(dot).toLowerCase() : '';
}

/**
 * Analyze repository file tree complexity.
 * Returns a score from 0–100 (higher = less complex = better).
 */
export function analyzeComplexity(
  tree: GithubTree,
  languages: Record<string, number>
): ComplexityResult {
  const blobs = tree.tree.filter((e) => e.type === 'blob');
  const codeBlobs = blobs.filter((e) => CODE_EXTENSIONS.has(getExtension(e.path)));
  const totalFiles = blobs.length;

  // Large files: > 25_000 bytes (~500 lines)
  const largeFiles = codeBlobs.filter((e) => (e.size ?? 0) > 25_000);

  // Deep directories: > 5 levels
  const dirDepths = new Set(
    tree.tree
      .filter((e) => e.type === 'tree')
      .map((e) => e.path.split('/').length)
  );
  const deepDirs = [...dirDepths].filter((d) => d > 5).length;

  // Top 10 most complex (largest) code files
  const topComplexFiles = [...codeBlobs]
    .sort((a, b) => (b.size ?? 0) - (a.size ?? 0))
    .slice(0, 10)
    .map((e) => e.path);

  // Penalty calculation
  const langCount = Object.keys(languages).length;
  const penalty =
    Math.min(largeFiles.length * 5, 40) +
    Math.min(deepDirs * 3, 20) +
    (langCount > 5 ? 10 : 0) +
    (totalFiles > 1000 ? 5 : 0) +
    (totalFiles > 5000 ? 10 : 0);

  const complexityScore = clamp(100 - penalty, 0, 100);

  return { complexityScore, topComplexFiles, totalFiles };
}
