import { createFileRoute } from '@tanstack/react-router';
import type React from 'react';

const MOCK_ORGS = [
  {
    id: '1',
    name: 'Neon Tech',
    owner: 'Alice Chen',
    members: 14,
    status: 'Active',
    created: '2026-01-10',
  },
  {
    id: '2',
    name: 'Atlas AI',
    owner: 'Bob Marley',
    members: 6,
    status: 'Active',
    created: '2026-02-01',
  },
  {
    id: '3',
    name: 'StartupIO',
    owner: 'Eva Rossi',
    members: 2,
    status: 'Pending',
    created: '2026-03-08',
  },
  {
    id: '4',
    name: 'DevCorp',
    owner: 'Dave Kim',
    members: 31,
    status: 'Active',
    created: '2025-11-20',
  },
];

const OrgsPage: React.FC = () => {
  return (
    <div className="px-10 py-12">
      <span className="mb-3 block text-[10px] font-bold uppercase tracking-[0.4em] text-brand-accent">
        Admin
      </span>
      <h1 className="mb-12 font-serif text-5xl text-white">Orgs</h1>

      <div className="rounded-2xl border border-white/[0.06] bg-zinc-900/60">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.05]">
              {['Name', 'Owner', 'Members', 'Status', 'Created'].map((col) => (
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
            {MOCK_ORGS.map((org) => (
              <tr key={org.id} className="transition-colors hover:bg-white/[0.02]">
                <td className="px-7 py-4 text-sm font-medium text-white">{org.name}</td>
                <td className="px-7 py-4 text-sm text-zinc-400">{org.owner}</td>
                <td className="px-7 py-4 text-sm text-zinc-400">{org.members}</td>
                <td className="px-7 py-4">
                  <span
                    className={`inline-block rounded-full border px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest ${
                      org.status === 'Active'
                        ? 'border-brand-accent/20 bg-brand-accent/10 text-brand-accent'
                        : 'border-white/10 bg-transparent text-zinc-500'
                    }`}
                  >
                    {org.status}
                  </span>
                </td>
                <td className="px-7 py-4 text-sm text-zinc-500">{org.created}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const Route = createFileRoute('/_admin/orgs')({
  component: OrgsPage,
});
