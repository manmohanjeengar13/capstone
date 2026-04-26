'use client';
import { usePathname } from 'next/navigation';
import { ChevronRight, Dna } from 'lucide-react';

const TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/analyze':   'Analyze Repository',
  '/reports':   'Reports',
};

function getTitle(pathname: string): string {
  for (const [prefix, title] of Object.entries(TITLES)) {
    if (pathname.startsWith(prefix)) return title;
  }
  return 'DNA Analyzer';
}

function Breadcrumb({ pathname }: { pathname: string }) {
  const segments = pathname.split('/').filter(Boolean);
  return (
    <div className="flex items-center gap-1.5 text-sm">
      <Dna className="w-3.5 h-3.5 text-muted-foreground" />
      {segments.map((seg, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <ChevronRight className="w-3 h-3 text-muted-foreground/40" />
          <span
            className={
              i === segments.length - 1
                ? 'text-foreground font-medium capitalize'
                : 'text-muted-foreground capitalize'
            }
          >
            {seg.length === 25 && seg.match(/^[a-z0-9]+$/)
              ? `${seg.slice(0, 8)}…`
              : seg}
          </span>
        </span>
      ))}
    </div>
  );
}

export function Topbar() {
  const pathname = usePathname();
  const title = getTitle(pathname);

  return (
    <header className="h-14 border-b border-border px-6 flex items-center justify-between bg-card/50 backdrop-blur-sm sticky top-0 z-20 md:top-0">
      <div className="flex flex-col gap-0.5">
        <h1 className="text-sm font-semibold text-foreground leading-none hidden md:block">
          {title}
        </h1>
        <div className="hidden md:block">
          <Breadcrumb pathname={pathname} />
        </div>
        {/* Mobile: just title */}
        <h1 className="text-sm font-semibold text-foreground md:hidden">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-muted border border-border">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-mono text-muted-foreground">LIVE</span>
        </div>
      </div>
    </header>
  );
}
