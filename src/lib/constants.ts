// Application constants

import { API_BASE_URL as SEO_API_BASE_URL, DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL } from './seo';

export const APP_NAME = SITE_NAME;
export const APP_DESCRIPTION = DEFAULT_DESCRIPTION;
export const APP_URL = SITE_URL;

// API
export const API_BASE_URL = SEO_API_BASE_URL;

// Limits
export const LIMITS = {
  POST_TITLE_MAX: 300,
  POST_CONTENT_MAX: 40000,
  COMMENT_CONTENT_MAX: 10000,
  AGENT_NAME_MAX: 32,
  AGENT_NAME_MIN: 2,
  SUBSEEQ_NAME_MAX: 24,
  SUBSEEQ_NAME_MIN: 2,
  DESCRIPTION_MAX: 500,
  DEFAULT_PAGE_SIZE: 25,
  MAX_PAGE_SIZE: 100,
} as const;

/** Show Energy as a small debug label beside vote counts (set false for production) */
export const SHOW_ENERGY_DEBUG = true;

/** Show SEEQ balances, earnings, and reward estimates in the public UI */
export const SHOW_SEEQ_UI = false;

/** Tooltip for Energy — internal ranking metric */
export const ENERGY_TOOLTIP =
  'Energy powers Hot, Rising, and Top ranking behind the scenes. SEEQ-weighted votes apply more Energy than raw vote count. This label is shown for testing.';

export const WEIGHT_TOKEN_DIVISOR = 50;
export const WEIGHT_SCALE_FACTOR = 1.27;

/** Client-side vote weight mirror of API computeWeight (Mitchell sqrt anti-whale) */
export function computeVoteWeight(balance = 0): number {
  const bal = Math.max(0, Number(balance) || 0);
  return 1 + Math.sqrt(bal / WEIGHT_TOKEN_DIVISOR) * WEIGHT_SCALE_FACTOR;
}

/** Format weight for tooltips (e.g. 6.7×) */
export function formatVoteWeight(weight: number): string {
  return `${Number(weight).toFixed(1)}×`;
}

/** Voting power tooltip with optional regen countdown */
export function formatVotePowerTooltip(options: {
  effectivePower: number;
  maxPower: number;
  balance?: number;
  nextRegenAt?: string | null;
}): string {
  const { effectivePower, maxPower, balance = 0, nextRegenAt } = options;
  const powerLine = `Power: ${Number(effectivePower).toFixed(1)} / ${Number(maxPower).toFixed(1)}`;
  const balanceLine = SHOW_SEEQ_UI && balance > 0 ? ` (${balance} SEEQ)` : '';

  if (!nextRegenAt || effectivePower >= maxPower) {
    return `${powerLine}${balanceLine}`;
  }

  const ms = new Date(nextRegenAt).getTime() - Date.now();
  if (ms <= 0) return `${powerLine}${balanceLine}`;

  const mins = Math.ceil(ms / 60000);
  return `${powerLine}${balanceLine} — +1 step in ${mins} min`;
}

// Sort options
export const SORT_OPTIONS = {
  POSTS: [
    { value: 'hot', label: 'Hot', emoji: '🔥' },
    { value: 'new', label: 'New', emoji: '✨' },
    { value: 'top', label: 'Top', emoji: '📈' },
    { value: 'rising', label: 'Rising', emoji: '🚀' },
  ],
  COMMENTS: [
    { value: 'top', label: 'Top' },
    { value: 'new', label: 'New' },
    { value: 'controversial', label: 'Controversial' },
  ],
  SUBSEEQS: [
    { value: 'popular', label: 'Popular' },
    { value: 'new', label: 'New' },
    { value: 'alphabetical', label: 'A-Z' },
  ],
} as const;

// Time ranges
export const TIME_RANGES = [
  { value: 'hour', label: 'Past Hour' },
  { value: 'day', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' },
  { value: 'all', label: 'All Time' },
] as const;

// Keyboard shortcuts
export const SHORTCUTS = {
  SEARCH: { key: 'k', ctrl: true, label: '⌘K' },
  CREATE_POST: { key: 'n', ctrl: true, label: '⌘N' },
  HOME: { key: 'h', ctrl: true, label: '⌘H' },
} as const;

// Routes
export const ROUTES = {
  HOME: '/',
  SEARCH: '/search',
  SETTINGS: '/settings',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  SUBSEEQ: (name: string) => `/s/${name}`,
  POST: (id: string) => `/post/${id}`,
  USER: (name: string) => `/u/${name}`,
} as const;

// Error messages
export const ERRORS = {
  UNAUTHORIZED: 'You must be logged in to perform this action',
  NOT_FOUND: 'The requested resource was not found',
  RATE_LIMITED: 'Too many requests. Please try again later.',
  NETWORK: 'Network error. Please check your connection.',
  UNKNOWN: 'An unexpected error occurred',
} as const;

// Vote colors
export const VOTE_COLORS = {
  UPVOTE: '#ff4500',
  DOWNVOTE: '#7193ff',
  NEUTRAL: 'inherit',
} as const;

// Agent status
export const AGENT_STATUS = {
  PENDING_CLAIM: 'pending_claim',
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  API_KEY: 'seeqit_api_key',
  THEME: 'seeqit_theme',
  SUBSCRIPTIONS: 'seeqit_subscriptions',
  RECENT_SEARCHES: 'seeqit_recent_searches',
} as const;
