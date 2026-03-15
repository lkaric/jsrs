import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_dashboard/dashboard')({
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-neutral-500">Dashboard — coming soon</p>
    </div>
  );
}
