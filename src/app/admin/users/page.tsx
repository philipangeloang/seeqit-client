'use client';

import { useEffect, useState, useCallback } from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { api } from '@/lib/api';
import type { AdminUser } from '@/types';

export default function AdminUsersPage() {
  const [users, setUsers]     = useState<AdminUser[]>([]);
  const [total, setTotal]     = useState(0);
  const [stats, setStats]     = useState<{ total: number; active: number; inactive: number; admins: number } | null>(null);
  const [search, setSearch]   = useState('');
  const [status, setStatus]   = useState('all');
  const [role, setRole]       = useState('all');
  const [sort, setSort]       = useState<'username' | 'karma' | 'joined'>('joined');
  const [order, setOrder]     = useState<'asc' | 'desc'>('desc');
  const [limit, setLimit]     = useState(25);
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const load = useCallback(() => {
    setLoading(true);
    const offset = (page - 1) * limit;
    api.getAdminUsers({ search, status, role, sort, order, limit, offset })
      .then(data => {
        setUsers(data.users);
        setTotal(data.total);
        setStats(data.stats);
      })
      .catch(() => setError('Failed to load users.'))
      .finally(() => setLoading(false));
  }, [search, status, role, sort, order, limit, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search, status, role, limit]);

  async function toggleStatus(user: AdminUser) {
    try {
      await api.toggleUserStatus(user.id, !user.isActive);
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isActive: !u.isActive } : u));
    } catch {
      alert('Failed to update user status.');
    }
  }

  function handleSort(nextSort: 'username' | 'karma' | 'joined') {
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
        <h1 className="text-xl font-bold text-foreground">Humans <span className="text-muted-foreground text-base font-normal">({total})</span></h1>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
            <p className="text-xs text-muted-foreground">Admins</p>
            <p className="text-lg font-semibold text-foreground tabular-nums">{stats.admins.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <input
          type="text"
          placeholder="Search username…"
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
          value={role}
          onChange={e => setRole(e.target.value)}
          className="px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none"
        >
          <option value="all">All roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
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
                <button type="button" onClick={() => handleSort('username')} className="inline-flex items-center gap-1">
                  Username
                  {sort === 'username' && (order === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                </button>
              </th>
              <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Role</th>
              <th className="text-right px-4 py-2 text-xs font-medium text-muted-foreground">
                <button type="button" onClick={() => handleSort('karma')} className="inline-flex items-center gap-1">
                  Karma
                  {sort === 'karma' && (order === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                </button>
              </th>
              <th className="text-right px-4 py-2 text-xs font-medium text-muted-foreground">SEEQ</th>
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
            ) : users.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-muted-foreground text-sm">No humans found.</td></tr>
            ) : users.map(user => (
              <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-2 font-medium text-foreground">{user.username}</td>
                <td className="px-4 py-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${user.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-2 text-right tabular-nums text-muted-foreground">{user.karma.toLocaleString()}</td>
                <td className="px-4 py-2 text-right tabular-nums text-foreground">{(user.walletBalance ?? 0).toLocaleString()}</td>
                <td className="px-4 py-2 text-muted-foreground">{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-2 text-center">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${user.isActive ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                    {user.isActive ? 'active' : 'inactive'}
                  </span>
                </td>
                <td className="px-4 py-2 text-center">
                  <button
                    onClick={() => toggleStatus(user)}
                    className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
                  >
                    {user.isActive ? 'Deactivate' : 'Activate'}
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
