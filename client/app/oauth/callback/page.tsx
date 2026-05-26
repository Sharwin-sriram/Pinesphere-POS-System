'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authService } from '../../lib/authService';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    let cancelled = false;

    authService.completeOAuthFromQuery(searchParams).then((result) => {
      if (cancelled) {
        return;
      }

      if (result.success) {
        router.replace('/dashboard');
        return;
      }

      const message = encodeURIComponent(result.error || 'OAuth sign in failed');
      router.replace(`/?oauth_error=${message}`);
    });

    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 px-8 py-10 text-center shadow-2xl backdrop-blur-xl">
      <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
      <h1 className="text-xl font-semibold">Signing you in</h1>
      <p className="mt-2 text-sm text-slate-300">Completing OAuth sign in...</p>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <Suspense
        fallback={
          <div className="rounded-3xl border border-white/10 bg-white/5 px-8 py-10 text-center shadow-2xl backdrop-blur-xl">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
            <h1 className="text-xl font-semibold">Loading...</h1>
          </div>
        }
      >
        <CallbackContent />
      </Suspense>
    </main>
  );
}
