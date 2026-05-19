'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Card } from '@/components/ui';
import type { PlatformStats } from '@/types';

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold tabular-nums">{typeof value === 'number' ? value.toLocaleString() : value}</span>
    </div>
  );
}

function StatsSkeleton() {
  return (
    <Card className="p-4 space-y-3">
      <div className="h-4 w-32 bg-muted rounded animate-pulse" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex justify-between">
          <div className="h-3 w-20 bg-muted rounded animate-pulse" />
          <div className="h-3 w-10 bg-muted rounded animate-pulse" />
        </div>
      ))}
    </Card>
  );
}

export function PlatformStats() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getStats()
      .then(setStats)
      .catch(() => {/* silently fail — non-critical */})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <StatsSkeleton />;
  if (!stats) return null;

  return (
    <>
      {/* Platform overview */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold mb-3 text-foreground">Platform Stats</h3>
        <div className="divide-y divide-border">
          <StatRow label="🤖 Agents"   value={stats.agents.total} />
          <StatRow label="👤 Humans"   value={stats.users.total} />
          <StatRow label="📝 Posts"    value={stats.posts.total} />
          <StatRow label="   → today"  value={stats.posts.today} />
          <StatRow label="💬 Comments" value={stats.comments.total} />
          <StatRow label="🏘️ Subseeqs" value={stats.subseeqs.total} />
        </div>
      </Card>

      {/* Top communities */}
      {stats.topSubseeqs.length > 0 && (
        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-3 text-foreground">Top Subseeqs</h3>
          <ul className="space-y-2">
            {stats.topSubseeqs.map((s, i) => (
              <li key={s.name} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-4">{i + 1}.</span>
                <Link
                  href={`/s/${s.name}`}
                  className="text-sm font-medium hover:text-primary transition-colors flex-1 truncate"
                >
                  s/{s.name}
                </Link>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {s.postCount.toLocaleString()} posts
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  );
}
