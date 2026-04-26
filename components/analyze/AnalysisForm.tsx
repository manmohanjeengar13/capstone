'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dna, Lightbulb, Loader2 } from 'lucide-react';
import { repoUrlSchema, type RepoUrlInput } from '@/validations/analyze.schema';
import { RepoSearchInput } from './RepoSearchInput';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import type { GithubRepo } from '@/types/github';

interface Props {
  onSubmit: (repoUrl: string) => Promise<void>;
  isLoading?: boolean;
}

const QUICK_REPOS = [
  { label: 'facebook/react',           url: 'https://github.com/facebook/react' },
  { label: 'vercel/next.js',           url: 'https://github.com/vercel/next.js' },
  { label: 'microsoft/vscode',         url: 'https://github.com/microsoft/vscode' },
  { label: 'tailwindlabs/tailwindcss', url: 'https://github.com/tailwindlabs/tailwindcss' },
  { label: 'prisma/prisma',            url: 'https://github.com/prisma/prisma' },
  { label: 'trpc/trpc',               url: 'https://github.com/trpc/trpc' },
];

export function AnalysisForm({ onSubmit, isLoading = false }: Props) {
  const form = useForm<RepoUrlInput>({
    resolver: zodResolver(repoUrlSchema),
    defaultValues: { repoUrl: '' },
  });

  const repoUrl = form.watch('repoUrl');

  const handleSelect = (repo: GithubRepo) => {
    form.setValue('repoUrl', repo.url, { shouldValidate: true });
  };

  const doSubmit = form.handleSubmit(async (data) => {
    await onSubmit(data.repoUrl);
  });

  return (
    <div className="w-full max-w-xl mx-auto animate-scale-in space-y-4">
      <Card>
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-3">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20">
              <Dna className="w-7 h-7 text-primary" />
            </div>
          </div>
          <CardTitle className="text-xl">Analyze a Repository</CardTitle>
          <CardDescription>
            Enter any public GitHub URL or search your repos
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={doSubmit} className="space-y-5">
              <FormField
                control={form.control}
                name="repoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Repository URL
                    </FormLabel>
                    <FormControl>
                      <RepoSearchInput
                        value={field.value}
                        onChange={(v) => form.setValue('repoUrl', v, { shouldValidate: !!v })}
                        onSelect={handleSelect}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 text-base gap-3 h-11"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Starting analysis…
                  </>
                ) : (
                  <>
                    <Dna className="w-5 h-5" />
                    Analyze Repository
                  </>
                )}
              </Button>
            </form>
          </Form>

          {/* Quick select */}
          <div className="mt-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Try a popular repo
            </p>
            <div className="flex flex-wrap gap-2">
              {QUICK_REPOS.map(({ label, url }) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => form.setValue('repoUrl', url, { shouldValidate: true })}
                  className="px-3 py-1.5 rounded-lg bg-muted border border-border text-xs font-mono text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all duration-150"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips card */}
      <Card className="border-primary/15 bg-primary/5">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="text-xs font-semibold text-primary">Pro tips</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Connect GitHub for private repo access and higher rate limits</li>
                <li>• Analysis takes 15–60 seconds depending on repo size</li>
                <li>• Reports are cached for 1 hour after first analysis</li>
                <li>• Rate limited to 5 analyses per hour per account</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
