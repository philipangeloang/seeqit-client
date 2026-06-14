'use client';

import useSWR from 'swr';
import { Coins } from 'lucide-react';
import { cn, formatScore } from '@/lib/utils';
import { Badge, Skeleton } from '@/components/ui';
import { api } from '@/lib/api';
import { SHOW_SEEQ_UI } from '@/lib/constants';
import type { RewardEstimate } from '@/types';

interface RewardEstimateBadgeProps {
  contentId: string;
  contentType: 'post' | 'comment';
  /** When API already returned an estimate (post detail, comments list) */
  estimate?: RewardEstimate | null;
  compact?: boolean;
  className?: string;
}

function RewardEstimateContent({
  estimate,
  compact,
  className,
}: {
  estimate: RewardEstimate;
  compact?: boolean;
  className?: string;
}) {
  const paid = estimate.isPayoutComplete && estimate.estimatedPayoutSeeq > 0;
  const pending = !estimate.isPayoutComplete && estimate.qualifies && estimate.estimatedPayoutSeeq > 0;
  const notQualifying = !estimate.qualifies && !paid;

  const label = paid
    ? `${formatScore(estimate.estimatedPayoutSeeq)} SEEQ paid`
    : pending
      ? `~${formatScore(estimate.estimatedPayoutSeeq)} SEEQ`
      : notQualifying
        ? 'No payout (outside top 40%)'
        : estimate.energy <= 0
          ? 'Earn SEEQ with upvotes'
          : '~0 SEEQ';

  if (compact) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-0.5 text-[10px] text-muted-foreground tabular-nums',
          pending && 'text-amber-600 dark:text-amber-400',
          paid && 'text-emerald-600 dark:text-emerald-400',
          className
        )}
        title={buildTooltip(estimate)}
      >
        <Coins className="h-3 w-3 shrink-0" />
        {label}
      </span>
    );
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-2 text-sm', className)}>
      <Badge
        variant={pending || paid ? 'default' : 'secondary'}
        className={cn('gap-1', paid && 'bg-emerald-600 hover:bg-emerald-600')}
      >
        <Coins className="h-3 w-3" />
        {paid ? 'Paid' : pending ? 'Potential' : 'Reward'}: {label}
      </Badge>
      {!compact && pending && estimate.daysUntilPayout > 0 && (
        <span className="text-muted-foreground">
          Payout in {estimate.daysUntilPayout}d · rank #{estimate.rank} of {estimate.totalInCohort}
        </span>
      )}
      {!compact && notQualifying && estimate.totalInCohort > 0 && (
        <span className="text-muted-foreground">
          Rank #{estimate.rank ?? '—'} · need top {estimate.qualifierCount} of {estimate.totalInCohort}
        </span>
      )}
    </div>
  );
}

function buildTooltip(estimate: RewardEstimate): string {
  const lines = [
    `Energy: ${estimate.energy}`,
    `Daily pool: ${formatScore(estimate.dailyPoolSeeq)} SEEQ`,
  ];
  if (estimate.qualifies && estimate.estimatedPayoutSeeq > 0) {
    lines.push(`Estimated share: ~${formatScore(estimate.estimatedPayoutSeeq)} SEEQ`);
  }
  if (!estimate.isPayoutComplete && estimate.daysUntilPayout > 0) {
    lines.push(`Payout window closes in ${estimate.daysUntilPayout} days`);
  }
  return lines.join(' · ');
}

export function RewardEstimateBadge({
  contentId,
  contentType,
  estimate: estimateProp,
  compact = false,
  className,
}: RewardEstimateBadgeProps) {
  if (!SHOW_SEEQ_UI) return null;

  const shouldFetch = !estimateProp && !!contentId;
  const { data: fetched, isLoading, error } = useSWR(
    shouldFetch ? ['reward-estimate', contentType, contentId] : null,
    () => contentType === 'post'
      ? api.getPostRewardEstimate(contentId)
      : api.getCommentRewardEstimate(contentId),
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  const estimate = estimateProp ?? fetched;

  if (isLoading && shouldFetch) {
    return compact ? (
      <Skeleton className={cn('h-3 w-16', className)} />
    ) : (
      <Skeleton className={cn('h-6 w-48', className)} />
    );
  }

  if (error || !estimate) return null;

  return (
    <RewardEstimateContent estimate={estimate} compact={compact} className={className} />
  );
}
