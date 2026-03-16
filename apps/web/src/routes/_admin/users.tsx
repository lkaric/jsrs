import { authClient } from '@jsrs/auth';
import { createFileRoute } from '@tanstack/react-router';
import type React from 'react';

const MOCK_USERS = [
  {
    id: '1',
    name: 'Alice Chen',
    email: 'alice@example.com',
    role: 'admin',
    provider: 'email',
    joined: '2026-03-01',
  },
  {
    id: '2',
    name: 'Bob Marley',
    email: 'bob@neon.tech',
    role: 'user',
    provider: 'github',
    joined: '2026-03-05',
  },
  {
    id: '3',
    name: 'Carol White',
    email: 'carol@atlas.ai',
    role: 'user',
    provider: 'google',
    joined: '2026-03-08',
  },
  {
    id: '4',
    name: 'Dave Kim',
    email: 'dave@example.com',
    role: 'user',
    provider: 'email',
    joined: '2026-03-10',
  },
  {
    id: '5',
    name: 'Eva Rossi',
    email: 'eva@startup.io',
    role: 'user',
    provider: 'github',
    joined: '2026-03-12',
  },
];

const UsersPage: React.FC = () => {
  const handleSetRole = (userId: string, role: 'admin' | 'user') => {
    void authClient.admin.setRole({ userId, role });
  };

  return (
    <div className="px-10 py-12">
      <span className="mb-3 block text-[10px] font-bold uppercase tracking-[0.4em] text-brand-accent">
        Admin
      </span>
      <h1 className="mb-12 font-serif text-5xl text-white">Users</h1>

      <div className="rounded-2xl border border-white/[0.06] bg-zinc-900/60">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.05]">
              {['Name', 'Email', 'Role', 'Provider', 'Joined', 'Actions'].map((col) => (
                <th
                  key={col}
                  className="px-7 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-zinc-500"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {MOCK_USERS.map((user) => (
              <tr key={user.id} className="transition-colors hover:bg-white/[0.02]">
                <td className="px-7 py-4 text-sm font-medium text-white">{user.name}</td>
                <td className="px-7 py-4 text-sm text-zinc-400">{user.email}</td>
                <td className="px-7 py-4">
                  <span
                    className={`inline-block rounded-full border px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest ${
                      user.role === 'admin'
                        ? 'border-brand-accent/20 bg-brand-accent/10 text-brand-accent'
                        : 'border-white/10 bg-transparent text-zinc-500'
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-7 py-4 text-sm capitalize text-zinc-500">{user.provider}</td>
                <td className="px-7 py-4 text-sm text-zinc-500">{user.joined}</td>
                <td className="px-7 py-4">
                  {user.role === 'admin' ? (
                    <button
                      type="button"
                      onClick={() => handleSetRole(user.id, 'user')}
                      className="text-xs text-zinc-500 transition-colors hover:text-red-400"
                    >
                      Revoke Admin
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSetRole(user.id, 'admin')}
                      className="text-xs text-zinc-500 transition-colors hover:text-brand-accent"
                    >
                      Make Admin
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const Route = createFileRoute('/_admin/users')({
  component: UsersPage,
});
