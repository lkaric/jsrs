import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: Home,
});

function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">JSRS</h1>
        <p className="mt-2 text-muted-foreground">
          Anonymous tech reviews, powered by Zero-Knowledge Proofs.
        </p>
      </div>
    </main>
  );
}
