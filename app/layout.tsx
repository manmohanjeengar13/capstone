import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'DNA Analyzer — Decode Your Codebase',
    template: '%s | DNA Analyzer',
  },
  description:
    'Deep analysis of any GitHub repository: complexity, commit patterns, risk areas, contributor behavior, and an overall project health score.',
  keywords: ['github', 'code analysis', 'repository health', 'developer tools', 'code quality'],
  openGraph: {
    type: 'website',
    title: 'DNA Analyzer',
    description: 'Decode your codebase DNA',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          theme="dark"
          toastOptions={{
            style: {
              background: 'hsl(224 15% 9%)',
              border: '1px solid hsl(215 20% 16%)',
              color: 'hsl(213 31% 91%)',
            },
          }}
        />
      </body>
    </html>
  );
}
