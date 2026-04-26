'use client';
import 'swagger-ui-react/swagger-ui.css';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft, Dna, ExternalLink } from 'lucide-react';

// Dynamically import SwaggerUI — it requires browser APIs
const SwaggerUI = dynamic(() => import('swagger-ui-react'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-32">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground font-mono">Loading API explorer…</p>
      </div>
    </div>
  ),
});

export default function DocsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Inject Swagger UI dark theme override
    const style = document.createElement('style');
    style.id = 'swagger-dark';
    style.textContent = `
      .swagger-ui { font-family: var(--font-geist), sans-serif !important; background: transparent !important; }
      .swagger-ui .topbar { display: none !important; }
      .swagger-ui .info { margin: 0 !important; }
      .swagger-ui .info .title { color: hsl(213 31% 91%) !important; font-size: 1.5rem !important; }
      .swagger-ui .info p, .swagger-ui .info li, .swagger-ui .renderedMarkdown p { color: hsl(215 16% 47%) !important; }
      .swagger-ui .scheme-container { background: hsl(224 15% 9%) !important; border: 1px solid hsl(215 20% 16%) !important; border-radius: 0.75rem !important; padding: 1rem !important; box-shadow: none !important; }
      .swagger-ui select { background: hsl(215 20% 13%) !important; color: hsl(213 31% 91%) !important; border: 1px solid hsl(215 20% 16%) !important; border-radius: 0.5rem !important; }
      .swagger-ui .opblock { background: hsl(224 15% 9%) !important; border: 1px solid hsl(215 20% 16%) !important; border-radius: 0.75rem !important; margin-bottom: 0.75rem !important; box-shadow: none !important; }
      .swagger-ui .opblock .opblock-summary { border-radius: 0.75rem !important; }
      .swagger-ui .opblock.opblock-post .opblock-summary { background: hsl(217 91% 60% / 0.08) !important; border-color: hsl(217 91% 60% / 0.2) !important; }
      .swagger-ui .opblock.opblock-get .opblock-summary { background: hsl(160 84% 39% / 0.08) !important; border-color: hsl(160 84% 39% / 0.2) !important; }
      .swagger-ui .opblock.opblock-delete .opblock-summary { background: hsl(0 72% 51% / 0.08) !important; border-color: hsl(0 72% 51% / 0.2) !important; }
      .swagger-ui .opblock-summary-method { border-radius: 0.375rem !important; font-family: var(--font-geist-mono) !important; font-size: 0.7rem !important; }
      .swagger-ui .opblock-summary-path { color: hsl(213 31% 91%) !important; font-family: var(--font-geist-mono) !important; }
      .swagger-ui .opblock-summary-description { color: hsl(215 16% 47%) !important; }
      .swagger-ui .opblock-body { background: hsl(224 15% 7%) !important; }
      .swagger-ui .opblock-description-wrapper p, .swagger-ui .opblock-section-header h4,
      .swagger-ui table thead tr th, .swagger-ui .parameter__name, .swagger-ui .parameter__type,
      .swagger-ui .parameter__in, .swagger-ui .response-col_status { color: hsl(213 31% 91%) !important; }
      .swagger-ui .response-col_description, .swagger-ui table tbody tr td { color: hsl(215 16% 47%) !important; }
      .swagger-ui .highlight-code > .microlight { background: hsl(224 15% 7%) !important; border: 1px solid hsl(215 20% 16%) !important; border-radius: 0.5rem !important; color: hsl(213 31% 91%) !important; }
      .swagger-ui input[type=text], .swagger-ui textarea { background: hsl(215 20% 13%) !important; color: hsl(213 31% 91%) !important; border: 1px solid hsl(215 20% 16%) !important; border-radius: 0.5rem !important; }
      .swagger-ui .btn { border-radius: 0.5rem !important; font-family: var(--font-geist) !important; }
      .swagger-ui .btn.execute { background: hsl(217 91% 60%) !important; border-color: hsl(217 91% 60%) !important; color: white !important; }
      .swagger-ui .btn.authorize { background: hsl(160 84% 39% / 0.1) !important; border-color: hsl(160 84% 39% / 0.4) !important; color: hsl(160 84% 39%) !important; }
      .swagger-ui .model-box { background: hsl(224 15% 7%) !important; border-radius: 0.5rem !important; }
      .swagger-ui .model { color: hsl(213 31% 91%) !important; }
      .swagger-ui section.models { border: 1px solid hsl(215 20% 16%) !important; border-radius: 0.75rem !important; background: hsl(224 15% 9%) !important; }
      .swagger-ui section.models h4 { color: hsl(213 31% 91%) !important; }
      .swagger-ui .tag-group .tag { color: hsl(213 31% 91%) !important; }
      .swagger-ui .opblock-tag { border-bottom: 1px solid hsl(215 20% 16%) !important; }
      .swagger-ui .opblock-tag:hover { background: hsl(215 20% 13%) !important; border-radius: 0.5rem !important; }
      .swagger-ui svg { fill: hsl(215 16% 47%) !important; }
      .swagger-ui .arrow { fill: hsl(215 16% 47%) !important; }
      .swagger-ui .servers > label select { max-width: 300px; }
      .swagger-ui .responses-table .response-col_links { display: none; }
    `;
    document.head.appendChild(style);
    return () => { document.getElementById('swagger-dark')?.remove(); };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <div className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Dna className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold text-foreground">DNA Analyzer</span>
            </Link>
            <span className="text-muted-foreground/40">/</span>
            <span className="text-sm text-muted-foreground">API Docs</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="btn-ghost text-sm gap-2">
              <ArrowLeft className="w-3.5 h-3.5" />
              Dashboard
            </Link>
            <a
              href="/api/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-sm gap-2"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Raw JSON
            </a>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="border-b border-border bg-card/30">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
              <Dna className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">DNA Analyzer API</h1>
              <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                Interactive API documentation. All endpoints require a valid session cookie
                (set automatically after OAuth login) or an{' '}
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                  Authorization: Bearer &lt;token&gt;
                </code>{' '}
                header. Rate limited at 5 analyses/hour.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {[
                  { label: 'OpenAPI 3.0', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
                  { label: 'REST',        color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
                  { label: 'JSON',        color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
                  { label: 'Better Auth', color: 'bg-violet-500/10 text-violet-400 border-violet-500/20' },
                ].map(({ label, color }) => (
                  <span key={label} className={`badge text-[10px] ${color}`}>{label}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Swagger UI */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        {mounted && (
          <SwaggerUI
            url="/api/docs"
            docExpansion="list"
            defaultModelsExpandDepth={1}
            displayOperationId={false}
            filter={false}
            tryItOutEnabled={true}
            requestInterceptor={(req) => {
              // Inject session cookie automatically
              req.credentials = 'include';
              return req;
            }}
          />
        )}
      </div>
    </div>
  );
}
