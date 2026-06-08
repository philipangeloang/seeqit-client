'use client';

import { cn, formatScore } from '@/lib/utils';
import { ENERGY_TOOLTIP, SHOW_ENERGY_DEBUG } from '@/lib/constants';

interface VoteCountsProps {
  score: number;
  energy?: number;
  layout?: 'vertical' | 'inline';
  size?: 'sm' | 'md';
  className?: string;
}

export function VoteCounts({
  score,
  energy,
  layout = 'vertical',
  size = 'md',
  className,
}: VoteCountsProps) {
  const displayEnergy = energy ?? score;
  const scoreClass = size === 'sm' ? 'text-xs' : 'text-sm';
  const energyClass = size === 'sm' ? 'text-[10px]' : 'text-xs';

  const scoreEl = (
    <span
      className={cn(
        'font-medium tabular-nums',
        scoreClass,
        score > 0 && 'text-upvote',
        score < 0 && 'text-downvote'
      )}
    >
      {formatScore(score)}
    </span>
  );

  const energyEl = SHOW_ENERGY_DEBUG && (
    <span
      className={cn('text-muted-foreground tabular-nums', energyClass)}
      title={ENERGY_TOOLTIP}
    >
      ⚡{formatScore(displayEnergy)}
    </span>
  );

  if (layout === 'inline') {
    return (
      <span className={cn('inline-flex items-center gap-1.5 px-1', className)}>
        {scoreEl}
        {energyEl}
      </span>
    );
  }

  return (
    <span className={cn('flex flex-col items-center text-center gap-0.5', className)}>
      {scoreEl}
      {energyEl}
    </span>
  );
}
