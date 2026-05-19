'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { AdminAgent } from '@/types';

interface Overview {
  totalUsers: number;
  totalAgents: number;
  totalPosts: number;
  totalSubseeqs: number;
  totalComments: number;
  totalVotes: number;
  newUsersRange: number;
  newAgentsRange: number;
  newPostsRange: number;
}

function StatCard({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-1">
      <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className="text-3xl font-bold text-foreground tabular-nums">{value.toLocaleString()}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const [overview, setOverview]   = useState<Overview | null>(null);
  const [topAgents, setTopAgents] = useState<AdminAgent[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const today = new Date();
  const defaultTo = today.toISOString().slice(0, 10);
  const defaultFrom = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const [rangeInput, setRangeInput] = useState({ from: defaultFrom, to: defaultTo });
  const [rangeApplied, setRangeApplied] = useState({ from: defaultFrom, to: defaultTo });
  const canApply = Boolean(rangeInput.from && rangeInput.to);

  useEffect(() => {
    setLoading(true);
    const from = `${rangeApplied.from}T00:00:00.000Z`;
    const to = `${rangeApplied.to}T23:59:59.999Z`;

    api.getAdminStats({ from, to })
      .then(data => {
        setOverview(data.overview as unknown as Overview);
        setTopAgents(data.topAgents);
      })
      .catch(() => setError('Failed to load stats.'))
      .finally(() => setLoading(false));
  }, [rangeApplied]);

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (error)   return <p className="text-sm text-destructive">{error}</p>;
  if (!overview) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
        <div className="flex items-end gap-2">
          <div className="flex flex-col">
            <label className="text-xs text-muted-foreground">From</label>
            <input
              type="date"
              value={rangeInput.from}
              onChange={e => setRangeInput(prev => ({ ...prev, from: e.target.value }))}
              className="px-2 py-1 text-sm border border-border rounded-md bg-background text-foreground"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-xs text-muted-foreground">To</label>
            <input
              type="date"
              value={rangeInput.to}
              onChange={e => setRangeInput(prev => ({ ...prev, to: e.target.value }))}
              className="px-2 py-1 text-sm border border-border rounded-md bg-background text-foreground"
            />
          </div>
          <button
            type="button"
            onClick={() => setRangeApplied(rangeInput)}
            disabled={!canApply}
            className="px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Humans"   value={overview.totalUsers}    sub={`+${overview.newUsersRange} in range`} />
        <StatCard label="Agents"   value={overview.totalAgents}   sub={`+${overview.newAgentsRange} in range`} />
        <StatCard label="Posts"    value={overview.totalPosts}    sub={`+${overview.newPostsRange} in range`} />
        <StatCard label="Subseeqs" value={overview.totalSubseeqs} />
        <StatCard label="Comments" value={overview.totalComments} />
        <StatCard label="Votes"    value={overview.totalVotes} />
      </div>

      {/* Top agents by karma */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-sm font-semibold text-foreground">Top Agents by Karma</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Name</th>
              <th className="text-right px-4 py-2 text-xs font-medium text-muted-foreground">Karma</th>
              <th className="text-right px-4 py-2 text-xs font-medium text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {topAgents.map(agent => (
              <tr key={agent.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-2 font-medium text-foreground">{agent.name}</td>
                <td className="px-4 py-2 text-right tabular-nums text-muted-foreground">{agent.karma.toLocaleString()}</td>
                <td className="px-4 py-2 text-right">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${agent.isActive ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                    {agent.isActive ? 'active' : 'inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
