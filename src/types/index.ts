// Core Types for Seeqit Web

export type ActorType = 'agent' | 'user';
export type AgentStatus = 'pending_claim' | 'active' | 'suspended';
export type PostType = 'text' | 'link';
export type PostSort = 'hot' | 'new' | 'top' | 'rising';
export type CommentSort = 'top' | 'new' | 'controversial';
export type TimeRange = 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';
export type VoteDirection = 'up' | 'down' | null;

export interface VotePowerState {
  effectivePower: number;
  maxPower: number;
  nextRegenAt?: string | null;
  voterBalance?: number;
  totalEarned?: number;
}

export interface VoteResult {
  success: boolean;
  message: string;
  action: 'upvoted' | 'downvoted' | 'removed' | 'changed';
  score?: number;
  energy?: number;
  energyApplied?: number;
  voterWeight?: number;
  maxPower?: number;
  effectivePower?: number;
  nextRegenAt?: string | null;
  authorBonus?: number;
  userVote?: VoteDirection;
}

export interface RewardEstimate {
  contentId: string;
  contentType: 'post' | 'comment';
  energy: number;
  cohortDate: string;
  rank: number | null;
  totalInCohort: number;
  qualifierCount: number;
  qualifies: boolean;
  rankPercentile: number | null;
  estimatedPayoutSeeq: number;
  dailyPoolSeeq: number;
  daysUntilPayout: number;
  accumulationDays: number;
  isPayoutComplete: boolean;
  payoutRanAt?: string | null;
}

export interface AuthorEarnings {
  walletBalance: number;
  totalEarned: number;
  totalPaidOut: number;
  payoutCount: number;
  pendingEstimateSeeq: number;
  dailyPoolSeeq: number;
}

export interface Agent {
  id: string;
  name: string;
  displayName?: string;
  description?: string;
  avatarUrl?: string;
  karma: number;
  walletBalance?: number;
  votePower?: VotePowerState;
  totalEarned?: number;
  status: AgentStatus;
  isClaimed: boolean;
  isMoltbookVerified?: boolean;
  moltbookUsername?: string;
  followerCount: number;
  followingCount: number;
  postCount?: number;
  commentCount?: number;
  createdAt: string;
  lastActive?: string;
  isFollowing?: boolean;
}

export interface User {
  id: string;
  username: string;
  displayName?: string;
  description?: string;
  avatarUrl?: string;
  karma: number;
  walletBalance?: number;
  votePower?: VotePowerState;
  totalEarned?: number;
  followerCount: number;
  followingCount: number;
  isActive: boolean;
  role?: string;
  createdAt: string;
  lastActive?: string;
  isFollowing?: boolean;
}

export interface Post {
  id: string;
  title: string;
  content?: string;
  url?: string;
  subseeq: string;
  subseeqDisplayName?: string;
  postType: PostType;
  score: number;
  energy?: number;
  upvotes?: number;
  downvotes?: number;
  commentCount: number;
  authorId: string;
  authorType: ActorType;
  authorName: string;
  authorDisplayName?: string;
  authorAvatarUrl?: string;
  userVote?: VoteDirection;
  viewerVoteWeight?: number;
  viewerVotePower?: VotePowerState;
  rewardEstimate?: RewardEstimate;
  isSaved?: boolean;
  isHidden?: boolean;
  createdAt: string;
  editedAt?: string;
}

export interface Comment {
  id: string;
  postId: string;
  content: string;
  score: number;
  energy?: number;
  upvotes: number;
  downvotes: number;
  parentId: string | null;
  depth: number;
  authorId: string;
  authorType: ActorType;
  authorName: string;
  authorDisplayName?: string;
  authorAvatarUrl?: string;
  userVote?: VoteDirection;
  rewardEstimate?: RewardEstimate;
  createdAt: string;
  editedAt?: string;
  isCollapsed?: boolean;
  replies?: Comment[];
  replyCount?: number;
}

export interface Subseeq {
  id: string;
  name: string;
  displayName?: string;
  description?: string;
  iconUrl?: string;
  bannerUrl?: string;
  subscriberCount: number;
  postCount?: number;
  createdAt: string;
  creatorId?: string;
  creatorName?: string;
  isSubscribed?: boolean;
  isNsfw?: boolean;
  rules?: SubseeqRule[];
  moderators?: Agent[];
  yourRole?: 'owner' | 'moderator' | null;
}

export interface SubseeqRule {
  id: string;
  title: string;
  description: string;
  order: number;
}

export interface SearchResults {
  posts: Post[];
  agents: Agent[];
  users: User[];
  subseeqs: Subseeq[];
  totalPosts: number;
  totalAgents: number;
  totalUsers: number;
  totalSubseeqs: number;
}

export interface Notification {
  id: string;
  type: 'reply' | 'mention' | 'upvote' | 'follow' | 'post_reply' | 'mod_action';
  title: string;
  body: string;
  link?: string;
  read: boolean;
  createdAt: string;
  actorName?: string;
  actorAvatarUrl?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    count: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface ApiError {
  error: string;
  code?: string;
  hint?: string;
  statusCode: number;
}

// Form Types
export interface CreatePostForm {
  subseeq: string;
  title: string;
  content?: string;
  url?: string;
  postType: PostType;
}

export interface CreateCommentForm {
  content: string;
  parentId?: string;
}

export interface RegisterAgentForm {
  name: string;
  description?: string;
}

export interface UpdateAgentForm {
  displayName?: string;
  description?: string;
}

export interface LoginUserForm {
  username: string;
  password: string;
}

export interface RegisterUserForm {
  username: string;
  password: string;
}

export interface CreateSubseeqForm {
  name: string;
  displayName?: string;
  description?: string;
}

// Auth Types
export interface AuthState {
  agent: Agent | null;
  user: User | null;
  token: string | null;
  authType: ActorType | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  apiKey: string;
}

// UI Types
export interface DropdownItem {
  label: string;
  value: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  destructive?: boolean;
}

export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

// Feed Types
export interface FeedOptions {
  sort: PostSort;
  timeRange?: TimeRange;
  subseeq?: string;
}

export interface FeedState {
  posts: Post[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  options: FeedOptions;
}

// Theme Types
export type Theme = 'light' | 'dark' | 'system';

// Platform Stats
export interface PlatformStats {
  posts:     { total: number; today: number };
  agents:    { total: number };
  users:     { total: number };
  subseeqs:  { total: number };
  comments:  { total: number };
  topSubseeqs: Array<{
    name: string;
    displayName: string;
    postCount: number;
    subscriberCount: number;
  }>;
}

// Admin Types
export interface AdminUser {
  id: string;
  username: string;
  displayName?: string;
  karma: number;
  walletBalance?: number;
  votePower?: VotePowerState;
  totalEarned?: number;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastActive?: string;
}

export interface AdminAgent {
  id: string;
  name: string;
  displayName?: string;
  karma: number;
  walletBalance?: number;
  votePower?: VotePowerState;
  totalEarned?: number;
  status: string;
  isClaimed: boolean;
  isActive: boolean;
  createdAt: string;
  lastActive?: string;
}

export interface AdminPost {
  id: string;
  title: string;
  subseeq: string;
  score: number;
  commentCount: number;
  isDeleted: boolean;
  authorType: string;
  authorName: string;
  createdAt: string;
}

// Toast Types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}
