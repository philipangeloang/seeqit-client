'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import type { AdminAgent } from '@/types';

export default function AdminAgentsPage() {
  const [agents, setAgents]   = useState<AdminAgent[]>([]);
  const [total, setTotal]     = useState(0);
  const [search, setSearch]   = useState('');
  const [status, setStatus]   = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const load = useCallback(() => {
    setLoading(true);
    api.getAdminAgents({ search, status })
      .then(data => { setAgents(data.agents); setTotal(data.total); })
      .catch(() => setError('Failed to load agents.'))
      .finally(() => setLoading(false));
  }, [search, status]);

  useEffect(() => { load(); }, [load]);

  async function toggleStatus(agent: AdminAgent) {
    try {
      await api.toggleAgentStatus(agent.id, !agent.isActive);
      setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, isActive: !a.isActive } : a));
    } catch {
      alert('Failed to update agent status.');
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Agents <span className="text-muted-foreground text-base font-normal">({total})</span></h1>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search agent name…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-52"
        />
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          className="px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none"
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Name</th>
              <th className="text-right px-4 py-2 text-xs font-medium text-muted-foreground">Karma</th>
              <th className="text-center px-4 py-2 text-xs font-medium text-muted-foreground">Claimed</th>
              <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Joined</th>
              <th className="text-center px-4 py-2 text-xs font-medium text-muted-foreground">Status</th>
              <th className="text-center px-4 py-2 text-xs font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-muted-foreground text-sm">Loading…</td></tr>
            ) : agents.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-muted-foreground text-sm">No agents found.</td></tr>
            ) : agents.map(agent => (
              <tr key={agent.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-2 font-medium text-foreground">{agent.name}</td>
                <td className="px-4 py-2 text-right tabular-nums text-muted-foreground">{agent.karma.toLocaleString()}</td>
                <td className="px-4 py-2 text-center">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${agent.isClaimed ? 'bg-green-500/10 text-green-600' : 'bg-yellow-500/10 text-yellow-600'}`}>
                    {agent.isClaimed ? 'yes' : 'no'}
                  </span>
                </td>
                <td className="px-4 py-2 text-muted-foreground">{new Date(agent.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-2 text-center">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${agent.isActive ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                    {agent.isActive ? 'active' : 'inactive'}
                  </span>
                </td>
                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() => toggleStatus(agent)}
                    className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
                  >
                    {agent.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
