import type { ReactNode } from 'react';

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas-light px-4 dark:bg-canvas-dark">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="font-mono text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            js<span className="text-brand-accent">.rs</span>
          </span>
        </div>
        {children}
      </div>
    </main>
  );
}
