'use client';
import { useState, useRef, useCallback } from 'react';
import api from '@/lib/axios';
import type { GithubRepo } from '@/types/github';
import type { ApiResponse } from '@/types/api';

export function useGithubSearch() {
  const [results, setResults] = useState<GithubRepo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const cacheRef = useRef<Map<string, GithubRepo[]>>(new Map());

  const search = useCallback((query: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!query.trim()) {
      setResults([]);
      return;
    }

    // Check cache
    const cached = cacheRef.current.get(query);
    if (cached) {
      setResults(cached);
      return;
    }

    timerRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const { data } = await api.get<ApiResponse<GithubRepo[]>>(
          `/api/github/search?q=${encodeURIComponent(query)}`
        );
        const repos = data.data ?? [];
        cacheRef.current.set(query, repos);
        setResults(repos);
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  return { search, results, isSearching, clearResults };
}
