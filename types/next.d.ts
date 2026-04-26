import type { NextRequest } from 'next/server';

declare module 'next/server' {
  interface NextRequest {
    user?: {
      id: string;
      email: string;
      name: string | null;
      avatarUrl: string | null;
      githubToken: string | null;
      githubLogin: string | null;
      createdAt: Date;
      updatedAt: Date;
    };
    requestId?: string;
  }
}

export {};
