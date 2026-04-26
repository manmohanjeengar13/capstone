import Link from 'next/link';
import { Dna, Layers, GitCommit, ShieldAlert, TrendingUp, Github, ArrowRight, Star } from 'lucide-react';
import { HealthScoreGauge } from '@/components/reports/HealthScoreGauge';

function DnaHeroAnimation() {
  return (
    <div className="flex flex-col gap-2.5 py-4" aria-hidden="true">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="dna-strand h-5"
          style={{ animationDelay: `${i * 0.175}s` }}
        >
          <div className="dna-dot dna-dot-left w-3 h-3" />
          <div className="dna-bridge" />
          <div className="dna-dot dna-dot-right w-3 h-3" />
        </div>
      ))}
    </div>
  );
}

const FEATURES = [
  {
    icon: Layers,
    title: 'Complexity Analysis',
    description:
      'Identify large files, deep nesting, and language sprawl. Get a complexity score with the top 10 most complex files ranked.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
  },
  {
    icon: GitCommit,
    title: 'Commit Patterns',
    description:
      'Visualize a 7×24 activity heatmap, detect burnout signals, measure commit hygiene, and spot dangerous inactivity gaps.',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10 border-violet-500/20',
  },
  {
    icon: ShieldAlert,
    title: 'Risk Areas',
    description:
      'Find missing lockfiles, stale repos, TODO/FIXME density, exposed secrets, and high-churn files — all ranked by severity.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20',
  },
  {
    icon: TrendingUp,
    title: 'Health Score',
    description:
      'A single 0–100 health score (A–F grade) computed from complexity, commit hygiene, risk signals, and velocity.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
  },
];

const EXAMPLE_METRICS = [
  { label: 'Complexity',    value: 78, color: 'text-blue-400' },
  { label: 'Commit Health', value: 85, color: 'text-violet-400' },
  { label: 'Risk Level',    value: 22, color: 'text-emerald-400' },
  { label: 'Velocity',      value: 70, color: 'text-amber-400' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Dna className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="text-sm font-bold tracking-tight">DNA Analyzer</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost gap-2 text-sm hidden sm:inline-flex"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
            <Link href="/login" className="btn-secondary text-sm">
              Sign In
            </Link>
            <Link href="/login" className="btn-primary text-sm">
              Get Started
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero-glow bg-grid relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-24 md:py-36">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Left: copy */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary font-medium mb-6">
                <Star className="w-3 h-3" />
                Open-source developer tool
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
                Decode Your{' '}
                <span className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
                  Codebase&apos;s DNA
                </span>
              </h1>
              <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Analyze any GitHub repository in seconds. Get deep insights into complexity,
                commit patterns, risk areas, and contributor behavior — all in one health score.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link href="/login" className="btn-primary text-base px-8 py-3 gap-3">
                  <Dna className="w-5 h-5" />
                  Start Analyzing Free
                </Link>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary text-base px-8 py-3 gap-3"
                >
                  <Github className="w-5 h-5" />
                  View on GitHub
                </a>
              </div>
              <p className="mt-4 text-xs text-muted-foreground/60">
                No credit card required · GitHub OAuth · AES-256 encrypted
              </p>
            </div>

            {/* Right: live demo card */}
            <div className="flex-shrink-0 w-full max-w-xs stagger-2">
              <div className="bg-card border border-border rounded-2xl p-6 shadow-2xl">
                {/* Fake repo header */}
                <div className="flex items-center gap-2 mb-5 pb-4 border-b border-border">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="ml-2 text-xs font-mono text-muted-foreground">
                    facebook/react
                  </span>
                </div>

                {/* Gauge */}
                <div className="flex justify-center mb-5">
                  <HealthScoreGauge score={74} grade="B" size={140} animated={false} />
                </div>

                {/* Mini metrics */}
                <div className="grid grid-cols-2 gap-2">
                  {EXAMPLE_METRICS.map(({ label, value, color }) => (
                    <div key={label} className="bg-muted/50 rounded-lg p-2.5">
                      <p className={`text-lg font-bold font-mono ${color}`}>{value}</p>
                      <p className="text-[10px] text-muted-foreground">{label}</p>
                    </div>
                  ))}
                </div>

                {/* DNA animation */}
                <div className="mt-5 pt-4 border-t border-border">
                  <DnaHeroAnimation />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 border-t border-border">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Everything you need to understand your codebase
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Four deep analysis dimensions, combined into one actionable health score.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FEATURES.map(({ icon: Icon, title, description, color, bg }, i) => (
              <div
                key={title}
                className="bg-card border border-border rounded-2xl p-6 card-hover"
                style={{ animation: `slide-in 0.4s ease-out ${0.05 + i * 0.05}s both` }}
              >
                <div className={`inline-flex p-2.5 rounded-xl border mb-4 ${bg}`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 border-t border-border bg-muted/20">
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight mb-4">How it works</h2>
          <p className="text-muted-foreground mb-14">Three steps to a complete DNA report</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Connect GitHub', desc: 'Sign in with GitHub OAuth. Your token is AES-256-GCM encrypted and never exposed.' },
              { step: '02', title: 'Submit a Repo', desc: 'Paste any GitHub URL or search your own repositories with real-time typeahead.' },
              { step: '03', title: 'Get Your Report', desc: 'In 15–60 seconds, get a full DNA report with scores, heatmaps, risk areas and contributor insights.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <span className="text-sm font-bold font-mono text-primary">{step}</span>
                </div>
                <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-border">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <DnaHeroAnimation />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Ready to decode your codebase?
          </h2>
          <p className="text-muted-foreground mb-8">
            Free forever for public repositories. Sign in with GitHub to get started.
          </p>
          <Link href="/login" className="btn-primary text-base px-10 py-3 gap-3">
            <Dna className="w-5 h-5" />
            Start Analyzing Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-6xl mx-auto px-4 md:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Dna className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">DNA Analyzer</span>
          </div>
          <p className="text-xs text-muted-foreground/60 font-mono">
            Built with Next.js 14 · TypeScript · PostgreSQL · Redis · Bull
          </p>
        </div>
      </footer>
    </div>
  );
}
