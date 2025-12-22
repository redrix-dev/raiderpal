"use client";

import { useEffect } from "react";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-xl rounded-lg border border-border-strong bg-surface-base/80 p-6 text-primary shadow-lg">
        <div className="text-xs uppercase tracking-[0.2em] text-muted font-semibold">
          Error
        </div>
        <h1 className="mt-2 text-2xl font-condensed font-semibold text-primary">
          Something went wrong
        </h1>
        <p className="mt-3 text-sm text-muted">
          Try again, or head back home if this keeps happening.
        </p>
        {error.message ? (
          <div className="mt-4 rounded-md border border-white/10 bg-black/30 px-4 py-3 text-xs text-muted">
            {error.message}
          </div>
        ) : null}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 rounded-md border border-brand-cyan/60 bg-surface-base/60 px-4 py-2.5 text-sm font-medium text-brand-cyan transition hover:border-brand-cyan hover:bg-surface-base/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-md border border-border-subtle bg-surface-base/60 px-4 py-2.5 text-sm font-medium text-primary transition hover:border-brand-cyan/60 hover:text-brand-cyan focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}
