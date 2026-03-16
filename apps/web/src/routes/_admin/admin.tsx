import { createFileRoute } from '@tanstack/react-router';
import type React from 'react';

const STATS = [
  { label: 'Total Users', value: '1,284' },
  { label: 'Total Orgs', value: '47' },
  { label: 'Active Jobs', value: '312' },
  { label: 'Applications', value: '4,891' },
];

const RECENT_USERS = [
  { id: '1', name: 'Alice Chen', email: 'alice@example.com', role: 'admin', joined: '2026-03-01' },
  { id: '2', name: 'Bob Marley', email: 'bob@neon.tech', role: 'user', joined: '2026-03-05' },
  { id: '3', name: 'Carol White', email: 'carol@atlas.ai', role: 'user', joined: '2026-03-08' },
  { id: '4', name: 'Dave Kim', email: 'dave@example.com', role: 'user', joined: '2026-03-10' },
];

const AdminPage: React.FC = () => {
  return (
    <div className="px-10 py-12">
      <span className="mb-3 block text-[10px] font-bold uppercase tracking-[0.4em] text-brand-accent">
        Admin
      </span>
      <h1 className="mb-12 font-serif text-5xl text-white">Overview</h1>

      {/* Stat cards */}
      <div className="mb-12 grid grid-cols-2 gap-5 xl:grid-cols-4">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-white/[0.06] bg-zinc-900/60 p-7"
          >
            <span className="mb-3 block text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              {stat.label}
            </span>
            <span className="font-serif text-4xl text-white">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Recent users */}
      <div className="rounded-2xl border border-white/[0.06] bg-zinc-900/60">
        <div className="border-b border-white/[0.05] px-7 py-5">
          <h2 className="font-serif text-2xl text-white">Recent Users</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.05]">
              <th className="px-7 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                Name
              </th>
              <th className="px-7 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                Email
              </th>
              <th className="px-7 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                Role
              </th>
              <th className="px-7 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                Joined
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {RECENT_USERS.map((user) => (
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
                <td className="px-7 py-4 text-sm text-zinc-500">{user.joined}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const Route = createFileRoute('/_admin/admin')({
  component: AdminPage,
});
