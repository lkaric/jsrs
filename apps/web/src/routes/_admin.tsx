import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { AdminLayout } from '@/features/admin/components/AdminLayout';

const AdminLayoutRoute: React.FC = () => {
  const { session } = Route.useRouteContext();
  const name = session?.user.name ?? '';
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <AdminLayout userInitials={initials || undefined}>
      <Outlet />
    </AdminLayout>
  );
};

export const Route = createFileRoute('/_admin')({
  beforeLoad: ({ context }) => {
    if (!context.session?.user) throw redirect({ to: '/login' });
    if ((context.session.user as { role?: string }).role !== 'admin') {
      throw redirect({ to: '/dashboard' });
    }
  },
  component: AdminLayoutRoute,
});
