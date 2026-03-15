import { createFileRoute } from '@tanstack/react-router';

const DashboardPage: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-neutral-500">Dashboard — coming soon</p>
    </div>
  );
};

export const Route = createFileRoute('/_dashboard/dashboard')({
  component: DashboardPage,
});
