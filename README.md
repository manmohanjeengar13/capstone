# 🧬 DNA Analyzer

> **Decode your codebase's DNA** — deep analysis of any GitHub repository: complexity, commit patterns, risk areas, developer behavior, and an overall health score.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?style=flat-square&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-green?style=flat-square&logo=postgresql)
![Redis](https://img.shields.io/badge/Redis-Upstash-red?style=flat-square&logo=redis)

---

## ✨ Features

| Dimension | What it measures |
|-----------|-----------------|
| **Complexity** | Large files, deep nesting, language sprawl, total file count |
| **Commit Patterns** | 7×24 activity heatmap, burnout signals, hygiene score, velocity, gaps |
| **Risk Areas** | Missing lockfiles, staleness, TODO density, exposed secrets, churn |
| **Developer Behavior** | Bus factor, ghost contributors, ownership concentration, churn ratio |
| **Health Score** | Weighted 0–100 score with A–F grade and 3-sentence summary |

---

## 🏗 Architecture

```
Single Next.js 14 repo (App Router)
├── Frontend  → React components, Zustand stores, Tailwind CSS dark theme
├── Backend   → Next.js API Routes (no Express)
├── Worker    → Standalone Bull worker process (Railway)
├── DB        → PostgreSQL via Prisma (Neon)
└── Cache     → Redis via ioredis (Upstash)
```

---

## 🚀 Quick Start

### 1. Clone & install

```bash
git clone <repo>
cd dna-analyzer
npm install
```

### 2. Set up environment variables

```bash
cp .env.local .env.local
# Fill in all values (see Environment Variables section below)
```

### 3. Set up database

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Run development

```bash
# Terminal 1 — Next.js app
npm run dev

# Terminal 2 — Bull worker (optional for local testing)
npm run worker
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 🔑 Environment Variables

```env
# PostgreSQL (Neon — https://neon.tech)
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require

# Redis (Upstash — https://upstash.com, use ioredis format)
REDIS_URL=redis://:token@host:port

# Better Auth
BETTER_AUTH_SECRET=your-32-char-secret
NEXT_PUBLIC_APP_URL=http://localhost:3000

# GitHub OAuth App
# Callback: http://localhost:3000/api/auth/callback/github
GITHUB_CLIENT_ID=your_id
GITHUB_CLIENT_SECRET=your_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_id
GOOGLE_CLIENT_SECRET=your_secret

# AES-256-GCM key — exactly 32 hex chars
# Generate: node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
ENCRYPTION_KEY=0123456789abcdef0123456789abcdef
```

---

## 📦 Project Structure

```
dna-analyzer/
├── app/                    # Next.js App Router
│   ├── api/               # Route handlers
│   ├── (auth)/            # Login page
│   ├── (dashboard)/       # Protected pages
│   └── page.tsx           # Landing page
├── analyzers/             # Pure analysis functions
├── components/            # React UI components
├── hooks/                 # Client-side data hooks
├── lib/                   # Server utilities (Prisma, Redis, crypto…)
├── queue/                 # Bull queue + worker
├── services/              # Business logic layer
├── store/                 # Zustand state management
├── types/                 # TypeScript type definitions
├── validations/           # Zod schemas
├── prisma/                # Database schema
└── worker.ts              # Standalone worker entry point
```

---

## 🌐 Deployment

### Next.js App → Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add all env vars in Vercel dashboard
4. Set build command: `prisma generate && next build`

### Bull Worker → Railway

1. Create new Railway service from same repo
2. Set start command: `npx ts-node --transpile-only worker.ts`
3. Add all same env vars
4. Deploy — worker runs independently, shares Redis queue with Vercel

### Database → Neon

1. Create free PostgreSQL database at [neon.tech](https://neon.tech)
2. Copy connection string to `DATABASE_URL`
3. Run `npx prisma migrate deploy` in Railway build step

### Redis → Upstash

1. Create Redis database at [upstash.com](https://upstash.com)
2. Copy ioredis connection string to `REDIS_URL`
3. Used for: Bull queue, rate limiting, report caching (1hr TTL)

---

## 🔒 Security

- **AES-256-GCM** encryption for GitHub tokens at rest
- **Session tokens** in httpOnly cookies (set by Better Auth)
- **Rate limiting** — 5 analyses/hour/user via Redis sliding window
- **Soft deletes** — reports use `deletedAt` timestamp
- **No secrets in logs** — Winston strips sensitive fields
- **Security headers** — X-Frame-Options, CSP, X-Content-Type-Options

---

## 🧪 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5.3 (strict) |
| Styling | Tailwind CSS + custom CSS vars |
| Auth | Better Auth (GitHub + Google OAuth) |
| Database | PostgreSQL + Prisma ORM |
| Cache/Queue | Redis (ioredis) + Bull |
| GitHub API | @octokit/rest |
| Forms | React Hook Form + Zod |
| State | Zustand (sessionStorage + localStorage) |
| Logging | Winston |
| Deployment | Vercel (app) + Railway (worker) + Neon (DB) + Upstash (Redis) |

---

## 📄 License

MIT — free to use, modify and deploy.
