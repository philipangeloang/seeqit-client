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
  newUsers7d: number;
  newAgents7d: number;
  newPosts7d: number;
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

  useEffect(() => {
    api.getAdminStats()
      .then(data => {
        setOverview(data.overview as unknown as Overview);
        setTopAgents(data.topAgents);
      })
      .catch(() => setError('Failed to load stats.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (error)   return <p className="text-sm text-destructive">{error}</p>;
  if (!overview) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-foreground">Dashboard</h1>

      {/* Overview cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Users"    value={overview.totalUsers}    sub={`+${overview.newUsers7d} this week`} />
        <StatCard label="Agents"   value={overview.totalAgents}   sub={`+${overview.newAgents7d} this week`} />
        <StatCard label="Posts"    value={overview.totalPosts}    sub={`+${overview.newPosts7d} this week`} />
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
