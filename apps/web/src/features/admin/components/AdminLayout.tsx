import { Link, useRouterState } from '@tanstack/react-router';
import { Briefcase, LayoutDashboard, LogOut, Users } from 'lucide-react';
import type React from 'react';

type Props = {
  children: React.ReactNode;
  userInitials?: string | undefined;
};

const NAV_ITEMS = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { to: '/users', label: 'Users', icon: Users, exact: false },
  { to: '/orgs', label: 'Orgs', icon: Briefcase, exact: false },
] as const;

export const AdminLayout: React.FC<Props> = ({ children, userInitials }) => {
  const { location } = useRouterState();
  const pathname = location.pathname;

  return (
    <div className="min-h-screen bg-canvas-dark">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 border-r border-white/[0.06] bg-zinc-950">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="px-6 pt-8 pb-6">
            <span className="block font-mono text-xl font-bold tracking-tight text-white">
              js<span className="text-brand-accent">.rs</span>
            </span>
            <span className="mt-1 block text-[9px] font-bold uppercase tracking-widest text-brand-accent">
              Admin
            </span>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3">
            {NAV_ITEMS.map(({ to, label, icon: Icon, exact }) => {
              const isActive = exact ? pathname === to : pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`mb-0.5 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    isActive
                      ? 'border-l-2 border-brand-accent bg-white/[0.04] pl-[10px] text-white'
                      : 'text-zinc-500 hover:bg-white/[0.02] hover:text-white'
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-white/[0.06] px-4 py-5">
            <Link
              to="/dashboard"
              className="mb-4 flex items-center gap-2 text-xs text-zinc-500 transition-colors hover:text-white"
            >
              <LogOut size={14} />
              Dashboard
            </Link>
            {userInitials && (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-xs font-semibold text-white">
                {userInitials}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 min-h-screen">{children}</main>
    </div>
  );
};
