'use client';

import { useEffect, useState, useCallback } from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { api } from '@/lib/api';
import type { AdminPost } from '@/types';

export default function AdminPostsPage() {
  const [posts, setPosts]     = useState<AdminPost[]>([]);
  const [total, setTotal]     = useState(0);
  const [stats, setStats]     = useState<{ total: number; active: number; deleted: number; last7d: number } | null>(null);
  const [search, setSearch]   = useState('');
  const [subseeq, setSubseeq] = useState('');
  const [deleted, setDeleted] = useState('all');
  const [sort, setSort]       = useState<'date' | 'score' | 'comments'>('date');
  const [order, setOrder]     = useState<'asc' | 'desc'>('desc');
  const [limit, setLimit]     = useState(25);
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const load = useCallback(() => {
    setLoading(true);
    const offset = (page - 1) * limit;
    api.getAdminPosts({ search, subseeq: subseeq || undefined, deleted, sort, order, limit, offset })
      .then(data => {
        setPosts(data.posts);
        setTotal(data.total);
        setStats(data.stats);
      })
      .catch(() => setError('Failed to load posts.'))
      .finally(() => setLoading(false));
  }, [search, subseeq, deleted, sort, order, limit, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search, subseeq, deleted, limit]);

  function handleSort(nextSort: 'date' | 'score' | 'comments') {
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
        <h1 className="text-xl font-bold text-foreground">Posts <span className="text-muted-foreground text-base font-normal">({total})</span></h1>
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
            <p className="text-xs text-muted-foreground">Deleted</p>
            <p className="text-lg font-semibold text-foreground tabular-nums">{stats.deleted.toLocaleString()}</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Last 7 days</p>
            <p className="text-lg font-semibold text-foreground tabular-nums">{stats.last7d.toLocaleString()}</p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <input
          type="text"
          placeholder="Search title…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-64"
        />
        <input
          type="text"
          placeholder="Filter subseeq…"
          value={subseeq}
          onChange={e => setSubseeq(e.target.value)}
          className="px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-44"
        />
        <select
          value={deleted}
          onChange={e => setDeleted(e.target.value)}
          className="px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none"
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="deleted">Deleted</option>
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
              <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Title</th>
              <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Author</th>
              <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Subseeq</th>
              <th className="text-right px-4 py-2 text-xs font-medium text-muted-foreground">
                <button type="button" onClick={() => handleSort('score')} className="inline-flex items-center gap-1">
                  Score
                  {sort === 'score' && (order === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                </button>
              </th>
              <th className="text-right px-4 py-2 text-xs font-medium text-muted-foreground">
                <button type="button" onClick={() => handleSort('comments')} className="inline-flex items-center gap-1">
                  Comments
                  {sort === 'comments' && (order === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                </button>
              </th>
              <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">
                <button type="button" onClick={() => handleSort('date')} className="inline-flex items-center gap-1">
                  Date
                  {sort === 'date' && (order === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                </button>
              </th>
              <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-muted-foreground text-sm">Loading…</td></tr>
            ) : posts.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-muted-foreground text-sm">No posts found.</td></tr>
            ) : posts.map(post => (
              <tr key={post.id} className={`hover:bg-muted/30 transition-colors ${post.isDeleted ? 'opacity-50' : ''}`}>
                <td className="px-4 py-2 max-w-xs">
                  <span className="truncate block font-medium text-foreground" title={post.title}>{post.title}</span>
                </td>
                <td className="px-4 py-2 text-muted-foreground">{post.authorName}</td>
                <td className="px-4 py-2 text-muted-foreground">s/{post.subseeq}</td>
                <td className="px-4 py-2 text-right tabular-nums text-muted-foreground">{post.score}</td>
                <td className="px-4 py-2 text-right tabular-nums text-muted-foreground">{post.commentCount}</td>
                <td className="px-4 py-2 text-muted-foreground">{new Date(post.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${post.isDeleted ? 'bg-red-500/10 text-red-600' : 'bg-green-500/10 text-green-600'}`}>
                    {post.isDeleted ? 'deleted' : 'active'}
                  </span>
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
