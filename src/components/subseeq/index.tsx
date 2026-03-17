'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn, formatScore, getInitials, getSubseeqUrl } from '@/lib/utils';
import { useAuth } from '@/hooks';
import { useSubscriptionStore } from '@/store';
import { Card, Avatar, AvatarImage, AvatarFallback, Button, Skeleton, Badge } from '@/components/ui';
import { Hash, Users, Plus, Check } from 'lucide-react';
import { api } from '@/lib/api';
import type { Subseeq } from '@/types';

interface SubseeqCardProps {
  subseeq: Subseeq;
  variant?: 'default' | 'compact';
}

export function SubseeqCard({ subseeq, variant = 'default' }: SubseeqCardProps) {
  const { isAuthenticated } = useAuth();
  const { isSubscribed, addSubscription, removeSubscription } = useSubscriptionStore();
  const [subscribing, setSubscribing] = React.useState(false);
  
  const subscribed = subseeq.isSubscribed || isSubscribed(subseeq.name);

  const handleSubscribe = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated || subscribing) return;

    setSubscribing(true);
    try {
      if (subscribed) {
        await api.unsubscribeSubseeq(subseeq.name);
        removeSubscription(subseeq.name);
      } else {
        await api.subscribeSubseeq(subseeq.name);
        addSubscription(subseeq.name);
      }
    } catch (err) {
      console.error('Subscribe failed:', err);
    } finally {
      setSubscribing(false);
    }
  };
  
  if (variant === 'compact') {
    return (
      <Link href={getSubseeqUrl(subseeq.name)} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted transition-colors">
        <Avatar className="h-8 w-8">
          <AvatarImage src={subseeq.iconUrl} />
          <AvatarFallback><Hash className="h-4 w-4" /></AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{subseeq.displayName || subseeq.name}</p>
          <p className="text-xs text-muted-foreground">{formatScore(subseeq.subscriberCount)} members</p>
        </div>
        {isAuthenticated && (
          <Button size="sm" variant={subscribed ? 'secondary' : 'default'} onClick={handleSubscribe} disabled={subscribing} className="h-7 px-2">
            {subscribed ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
          </Button>
        )}
      </Link>
    );
  }
  
  return (
    <Card className="p-4 hover:border-muted-foreground/20 transition-colors">
      <Link href={getSubseeqUrl(subseeq.name)} className="block">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={subseeq.iconUrl} />
            <AvatarFallback><Hash className="h-6 w-6" /></AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold truncate">{subseeq.displayName || subseeq.name}</h3>
              {subseeq.isNsfw && <Badge variant="destructive" className="text-xs">NSFW</Badge>}
            </div>
            <p className="text-sm text-muted-foreground">s/{subseeq.name}</p>
            {subseeq.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{subseeq.description}</p>
            )}
            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              {formatScore(subseeq.subscriberCount)} members
            </div>
          </div>
          
          {isAuthenticated && (
            <Button size="sm" variant={subscribed ? 'secondary' : 'default'} onClick={handleSubscribe} disabled={subscribing}>
              {subscribed ? 'Joined' : 'Join'}
            </Button>
          )}
        </div>
      </Link>
    </Card>
  );
}

// Subseeq List
export function SubseeqList({ subseeqs, isLoading, variant = 'default' }: { subseeqs: Subseeq[]; isLoading?: boolean; variant?: 'default' | 'compact' }) {
  if (isLoading) {
    return (
      <div className={cn('space-y-4', variant === 'compact' && 'space-y-1')}>
        {Array.from({ length: 5 }).map((_, i) => (
          <SubseeqCardSkeleton key={i} variant={variant} />
        ))}
      </div>
    );
  }

  if (subseeqs.length === 0) {
    return (
      <div className="text-center py-8">
        <Hash className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
        <p className="text-muted-foreground">No subseeqs found</p>
      </div>
    );
  }
  
  return (
    <div className={cn('space-y-4', variant === 'compact' && 'space-y-1')}>
      {subseeqs.map(subseeq => (
        <SubseeqCard key={subseeq.id} subseeq={subseeq} variant={variant} />
      ))}
    </div>
  );
}

// Subseeq Card Skeleton
export function SubseeqCardSkeleton({ variant = 'default' }: { variant?: 'default' | 'compact' }) {
  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3 p-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="flex-1 space-y-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-7 w-14" />
      </div>
    );
  }
  
  return (
    <Card className="p-4">
      <div className="flex items-start gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-9 w-16" />
      </div>
    </Card>
  );
}

// Sidebar Subseeq Widget
export function SidebarSubseeqs({ subseeqs, title = 'Communities' }: { subseeqs: Subseeq[]; title?: string }) {
  return (
    <Card>
      <div className="p-4 border-b">
        <h3 className="font-semibold text-sm">{title}</h3>
      </div>
      <div className="p-2">
        <SubseeqList subseeqs={subseeqs} variant="compact" />
      </div>
      <div className="p-2 border-t">
        <Link href="/subseeqs">
          <Button variant="ghost" className="w-full text-sm">View all subseeqs</Button>
        </Link>
      </div>
    </Card>
  );
}

// Create Subseeq Button
export function CreateSubseeqButton() {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) return null;
  
  return (
    <Link href="/subseeqs/create">
      <Button className="w-full gap-2">
        <Plus className="h-4 w-4" />
        Create Subseeq
      </Button>
    </Link>
  );
}
