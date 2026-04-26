'use client';
import { useState } from 'react';
import { Dna, Github, Chrome, Loader2 } from 'lucide-react';
import { signIn } from '@/lib/auth-client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function LoginPage() {
  const [loading, setLoading] = useState<'github' | 'google' | null>(null);

  const handleOAuth = async (provider: 'github' | 'google') => {
    setLoading(provider);
    try {
      await signIn.social({ provider, callbackURL: '/dashboard' });
    } catch {
      toast.error(`Failed to sign in with ${provider === 'github' ? 'GitHub' : 'Google'}`);
      setLoading(null);
    }
  };

  return (
    <div className="w-full max-w-md animate-scale-in">
      <Card className="shadow-2xl">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-lg">
              <Dna className="w-7 h-7 text-primary" />
            </div>
          </div>
          <CardTitle className="text-xl">Sign in to DNA Analyzer</CardTitle>
          <CardDescription className="mt-1">
            Connect your GitHub account to start analyzing repositories
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs text-muted-foreground">
              <span className="bg-card px-3">Continue with</span>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => handleOAuth('github')}
              disabled={loading !== null}
              className="w-full h-11 bg-[#24292e] hover:bg-[#2f363d] border border-[#444c56] text-white gap-3"
              variant="outline"
            >
              {loading === 'github' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Github className="w-4 h-4" />
              )}
              Continue with GitHub
            </Button>

            <Button
              onClick={() => handleOAuth('google')}
              disabled={loading !== null}
              variant="outline"
              className="w-full h-11 gap-3"
            >
              {loading === 'google' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Chrome className="w-4 h-4 text-blue-400" />
              )}
              Continue with Google
            </Button>
          </div>

          <p className="text-center text-[11px] text-muted-foreground/60 leading-relaxed pt-2">
            By continuing, you agree to our Terms of Service.
            <br />
            GitHub token is encrypted with AES-256-GCM and never exposed.
          </p>
        </CardContent>
      </Card>

      <p className="mt-6 text-center text-xs text-muted-foreground/40">
        DNA Analyzer — Open source dev tool
      </p>
    </div>
  );
}
