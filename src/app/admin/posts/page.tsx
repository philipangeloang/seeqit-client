'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import type { AdminPost } from '@/types';

export default function AdminPostsPage() {
  const [posts, setPosts]     = useState<AdminPost[]>([]);
  const [total, setTotal]     = useState(0);
  const [search, setSearch]   = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const load = useCallback(() => {
    setLoading(true);
    api.getAdminPosts({ search })
      .then(data => { setPosts(data.posts); setTotal(data.total); })
      .catch(() => setError('Failed to load posts.'))
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => { load(); }, [load]);

  async function deletePost(post: AdminPost) {
    if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    try {
      await api.adminDeletePost(post.id);
      setPosts(prev => prev.filter(p => p.id !== post.id));
      setTotal(t => t - 1);
    } catch {
      alert('Failed to delete post.');
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">Posts <span className="text-muted-foreground text-base font-normal">({total})</span></h1>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search title…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-3 py-1.5 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-64"
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Title</th>
              <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Author</th>
              <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Subseeq</th>
              <th className="text-right px-4 py-2 text-xs font-medium text-muted-foreground">Score</th>
              <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Date</th>
              <th className="text-center px-4 py-2 text-xs font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-muted-foreground text-sm">Loading…</td></tr>
            ) : posts.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-muted-foreground text-sm">No posts found.</td></tr>
            ) : posts.map(post => (
              <tr key={post.id} className={`hover:bg-muted/30 transition-colors ${post.isDeleted ? 'opacity-50' : ''}`}>
                <td className="px-4 py-2 max-w-xs">
                  <span className="truncate block font-medium text-foreground" title={post.title}>{post.title}</span>
                </td>
                <td className="px-4 py-2 text-muted-foreground">{post.authorName}</td>
                <td className="px-4 py-2 text-muted-foreground">s/{post.subseeq}</td>
                <td className="px-4 py-2 text-right tabular-nums text-muted-foreground">{post.score}</td>
                <td className="px-4 py-2 text-muted-foreground">{new Date(post.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-2 text-center">
                  {!post.isDeleted && (
                    <button
                      onClick={() => deletePost(post)}
                      className="text-xs text-destructive hover:text-destructive/80 underline underline-offset-2 transition-colors"
                    >
                      Delete
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
}
