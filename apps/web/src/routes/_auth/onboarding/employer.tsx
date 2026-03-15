import { createFileRoute } from '@tanstack/react-router';

const EmployerOnboardingPage: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-neutral-500">Employer onboarding — coming soon</p>
    </div>
  );
};

export const Route = createFileRoute('/_auth/onboarding/employer')({
  component: EmployerOnboardingPage,
});
