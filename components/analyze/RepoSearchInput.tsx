'use client';
import { useRef, useEffect } from 'react';
import { Search, Star, GitFork, Loader2 } from 'lucide-react';
import { useGithubSearch } from '@/hooks/useGithubSearch';
import type { GithubRepo } from '@/types/github';

interface Props {
  value: string;
  onChange: (value: string) => void;
  onSelect: (repo: GithubRepo) => void;
  placeholder?: string;
  error?: string;
}

export function RepoSearchInput({
  value,
  onChange,
  onSelect,
  placeholder = 'https://github.com/owner/repo',
  error,
}: Props) {
  const { search, results, isSearching, clearResults } = useGithubSearch();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Trigger search when input changes
  const handleChange = (v: string) => {
    onChange(v);
    // Only search if it looks like a query (not a full URL)
    if (!v.includes('github.com/') && v.trim().length > 1) {
      search(v);
    } else {
      clearResults();
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        clearResults();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [clearResults]);

  const handleSelect = (repo: GithubRepo) => {
    onSelect(repo);
    clearResults();
    inputRef.current?.blur();
  };

  const showDropdown = results.length > 0 || isSearching;

  return (
    <div ref={containerRef} className="relative w-full">
      <div className={`relative flex items-center ${error ? 'ring-1 ring-destructive rounded-lg' : ''}`}>
        <Search className="absolute left-3.5 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          className="input pl-10 pr-10"
          autoComplete="off"
          spellCheck={false}
        />
        {isSearching && (
          <Loader2 className="absolute right-3.5 w-4 h-4 text-muted-foreground animate-spin" />
        )}
      </div>

      {error && (
        <p className="mt-1.5 text-xs text-destructive">{error}</p>
      )}

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden animate-scale-in">
          {isSearching && results.length === 0 ? (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Searching repositories…
            </div>
          ) : (
            <ul>
              {results.map((repo) => (
                <li key={repo.id}>
                  <button
                    onClick={() => handleSelect(repo)}
                    className="w-full flex items-start gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left border-b border-border/40 last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground font-mono truncate">
                        {repo.fullName}
                      </p>
                      {repo.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {repo.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 text-xs text-muted-foreground">
                      {repo.language && (
                        <span className="hidden sm:block">{repo.language}</span>
                      )}
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        {repo.stars >= 1000
                          ? `${(repo.stars / 1000).toFixed(1)}k`
                          : repo.stars}
                      </span>
                      <span className="flex items-center gap-1">
                        <GitFork className="w-3 h-3" />
                        {repo.forks}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
