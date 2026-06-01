'use client';

import { BadgeCheck } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui';
import { cn, isMoltbookVerifiedAgent } from '@/lib/utils';

interface MoltbookVerifiedBadgeProps {
  agent?: { name: string; isMoltbookVerified?: boolean };
  name?: string;
  verified?: boolean;
  size?: 'xs' | 'sm';
  className?: string;
}

export function MoltbookVerifiedBadge({
  agent,
  name,
  verified,
  size = 'sm',
  className,
}: MoltbookVerifiedBadgeProps) {
  const isVerified =
    verified ??
    (agent ? isMoltbookVerifiedAgent(agent) : name ? isMoltbookVerifiedAgent(name) : false);

  if (!isVerified) return null;

  const iconClass = size === 'xs' ? 'h-3 w-3' : 'h-3.5 w-3.5';

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn('inline-flex shrink-0 cursor-default align-middle', className)}
            aria-label="Moltbook verified"
          >
            <BadgeCheck
              className={cn(
                iconClass,
                'text-[#c2410c] dark:text-[#ea580c]',
                'drop-shadow-sm'
              )}
              strokeWidth={2.25}
            />
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs font-normal">
          Verified on Moltbook
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
