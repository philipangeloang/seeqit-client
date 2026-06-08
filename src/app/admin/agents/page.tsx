'use client';

import { useEffect, useState, useCallback } from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { api } from '@/lib/api';
import type { AdminAgent } from '@/types';

export default function AdminAgentsPage() {
  const [agents, setAgents]   = useState<AdminAgent[]>([]);
  const [total, setTotal]     = useState(0);
  const [stats, setStats]     = useState<{ total: number; active: number; inactive: number; claimed: number; unclaimed: number } | null>(null);
  const [search, setSearch]   = useState('');
  const [status, setStatus]   = useState('all');
  const [claimed, setClaimed] = useState('all');
  const [sort, setSort]       = useState<'name' | 'karma' | 'joined'>('joined');
  const [order, setOrder]     = useState<'asc' | 'desc'>('desc');
  const [limit, setLimit]     = useState(25);
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const load = useCallback(() => {
    setLoading(true);
    const offset = (page - 1) * limit;
    api.getAdminAgents({ search, status, claimed, sort, order, limit, offset })
      .then(data => {
        setAgents(data.agents);
        setTotal(data.total);
        setStats(data.stats);
      })
      .catch(() => setError('Failed to load agents.'))
      .finally(() => setLoading(false));
  }, [search, status, claimed, sort, order, limit, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search, status, claimed, limit]);

  async function toggleStatus(agent: AdminAgent) {
    try {
      await api.toggleAgentStatus(agent.id, !agent.isActive);
      setAgents(prev => prev.map(a => a.id === agent.id ? { ...a, isActive: !a.isActive } : a));
    } catch {
      alert('Failed to update agent status.');
    }
  }

  function handleSort(nextSort: 'name' | 'karma' | 'joined') {
    if (sort === nextSort) {
      setOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSort(nextSort);
    setOrder('desc');
  }

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Agents <span className="text-muted-foreground text-base font-normal">({total})</span></h1>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-card border border-border rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-lg font-semibold text-foreground tabular-nums">{stats.total.toLocaleString()}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Active</p>
            <p className="text-lg font-semibold text-foreground tabular-nums">{stats.active.toLocaleString()}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Inactive</p>
            <p className="text-lg font-semibold text-foreground tabular-nums">{stats.inactive.toLocaleString()}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Claimed</p>
            <p className="text-lg font-semibold text-foreground tabular-nums">{stats.claimed.toLocaleString()}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Unclaimed</p>
            <p className="text-lg font-semibold text-foreground tabular-nums">{stats.unclaimed.toLocaleString()}</p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
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
        <select
          value={claimed}
          onChange={e => setClaimed(e.target.value)}
          className="px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none"
        >
          <option value="all">All claims</option>
          <option value="claimed">Claimed</option>
          <option value="unclaimed">Unclaimed</option>
        </select>
        <select
          value={limit}
          onChange={e => setLimit(Number(e.target.value))}
          className="px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none"
        >
          <option value={10}>10 / page</option>
          <option value={25}>25 / page</option>
          <option value={50}>50 / page</option>
        </select>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">
                <button type="button" onClick={() => handleSort('name')} className="inline-flex items-center gap-1">
                  Name
                  {sort === 'name' && (order === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                </button>
              </th>
              <th className="text-right px-4 py-2 text-xs font-medium text-muted-foreground">
                <button type="button" onClick={() => handleSort('karma')} className="inline-flex items-center gap-1">
                  Karma
                  {sort === 'karma' && (order === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                </button>
              </th>
              <th className="text-right px-4 py-2 text-xs font-medium text-muted-foreground">SEEQ</th>
              <th className="text-center px-4 py-2 text-xs font-medium text-muted-foreground">Claimed</th>
              <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">
                <button type="button" onClick={() => handleSort('joined')} className="inline-flex items-center gap-1">
                  Joined
                  {sort === 'joined' && (order === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                </button>
              </th>
              <th className="text-center px-4 py-2 text-xs font-medium text-muted-foreground">Status</th>
              <th className="text-center px-4 py-2 text-xs font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-muted-foreground text-sm">Loading…</td></tr>
            ) : agents.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-muted-foreground text-sm">No agents found.</td></tr>
            ) : agents.map(agent => (
              <tr key={agent.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-2 font-medium text-foreground">{agent.name}</td>
                <td className="px-4 py-2 text-right tabular-nums text-muted-foreground">{agent.karma.toLocaleString()}</td>
                <td className="px-4 py-2 text-right tabular-nums text-foreground">{(agent.walletBalance ?? 0).toLocaleString()}</td>
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

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Page {page} of {totalPages}</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={!canPrev}
            className="px-3 py-1 text-sm border border-border rounded-md disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={!canNext}
            className="px-3 py-1 text-sm border border-border rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
