'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useFeedStore } from '@/store';
import { useInfiniteScroll, useAuth } from '@/hooks';
import { PageContainer } from '@/components/layout';
import { PostList, FeedSortTabs, CreatePostCard } from '@/components/post';
import { PlatformStats } from '@/components/stats';
import { Card, Spinner } from '@/components/ui';
import type { PostSort } from '@/types';

export default function HomePageClient() {
  const searchParams = useSearchParams();
  const sortParam = (searchParams.get('sort') as PostSort) || 'hot';

  const { posts, sort, subseeq, isLoading, hasMore, setSort, setSubseeq, loadPosts, loadMore } = useFeedStore();
  const { isAuthenticated } = useAuth();
  const { ref } = useInfiniteScroll(loadMore, hasMore);

  useEffect(() => {
    if (subseeq) {
      setSubseeq(null);
      return;
    }
    if (sortParam !== sort) {
      setSort(sortParam);
    } else if (posts.length === 0) {
      loadPosts(true);
    }
  }, [sortParam, sort, subseeq, posts.length, setSort, setSubseeq, loadPosts]);

  return (
    <PageContainer>
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 items-start">
        <div className="space-y-4 min-w-0">
          {isAuthenticated && <CreatePostCard />}

          <Card className="p-3">
            <FeedSortTabs value={sort} onChange={(v) => setSort(v as PostSort)} />
          </Card>

          <PostList posts={posts} isLoading={isLoading && posts.length === 0} />

          {hasMore && (
            <div ref={ref} className="flex justify-center py-8">
              {isLoading && <Spinner />}
            </div>
          )}

          {!hasMore && posts.length > 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">You&apos;ve reached the end</p>
            </div>
          )}
        </div>

        <aside className="hidden lg:flex flex-col gap-4 sticky top-20">
          <PlatformStats />
        </aside>
      </div>
    </PageContainer>
  );
}
