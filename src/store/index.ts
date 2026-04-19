import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Agent, User, ActorType, Post, PostSort, TimeRange, Notification } from '@/types';
import { api } from '@/lib/api';

// Auth Store — supports both agent (API key) and human (JWT) auth
interface AuthStore {
  agent: Agent | null;
  user: User | null;
  token: string | null;
  authType: ActorType | null;
  isLoading: boolean;
  error: string | null;

  loginAgent: (apiKey: string) => Promise<void>;
  loginUser: (username: string, password: string) => Promise<void>;
  registerUser: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;

  // Backward compat alias
  login: (apiKey: string) => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      agent: null,
      user: null,
      token: null,
      authType: null,
      isLoading: false,
      error: null,

      loginAgent: async (apiKey: string) => {
        set({ isLoading: true, error: null });
        try {
          api.setToken(apiKey);
          const agent = await api.getMe();
          set({ agent, user: null, token: apiKey, authType: 'agent', isLoading: false });
        } catch (err) {
          api.clearToken();
          set({ error: (err as Error).message, isLoading: false, agent: null, user: null, token: null, authType: null });
          throw err;
        }
      },

      loginUser: async (username: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const result = await api.loginUser({ username, password });
          api.setToken(result.token);
          set({ user: result.user, agent: null, token: result.token, authType: 'user', isLoading: false });
        } catch (err) {
          api.clearToken();
          set({ error: (err as Error).message, isLoading: false, agent: null, user: null, token: null, authType: null });
          throw err;
        }
      },

      registerUser: async (username: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const result = await api.registerUser({ username, password });
          api.setToken(result.token);
          set({ user: result.user, agent: null, token: result.token, authType: 'user', isLoading: false });
        } catch (err) {
          api.clearToken();
          set({ error: (err as Error).message, isLoading: false, agent: null, user: null, token: null, authType: null });
          throw err;
        }
      },

      logout: () => {
        api.clearToken();
        set({ agent: null, user: null, token: null, authType: null, error: null });
      },

      refresh: async () => {
        const { token, authType } = get();
        if (!token) return;
        try {
          api.setToken(token);
          if (authType === 'user') {
            const user = await api.getUserMe();
            set({ user });
          } else {
            const agent = await api.getMe();
            set({ agent });
          }
        } catch {
          api.clearToken();
          set({ agent: null, user: null, token: null, authType: null, error: null });
        }
      },

      // Backward compat: login() is alias for loginAgent()
      login: async (apiKey: string) => {
        return get().loginAgent(apiKey);
      },
    }),
    {
      name: 'seeqit-auth',
      partialize: (state) => ({ token: state.token, authType: state.authType })
    }
  )
);

// Feed Store
interface FeedStore {
  posts: Post[];
  sort: PostSort;
  timeRange: TimeRange;
  subseeq: string | null;
  isLoading: boolean;
  hasMore: boolean;
  offset: number;

  setSort: (sort: PostSort) => void;
  setTimeRange: (timeRange: TimeRange) => void;
  setSubseeq: (subseeq: string | null) => void;
  loadPosts: (reset?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
  updatePostVote: (postId: string, vote: 'up' | 'down' | null, scoreDiff: number) => void;
}

export const useFeedStore = create<FeedStore>((set, get) => ({
  posts: [],
  sort: 'hot',
  timeRange: 'day',
  subseeq: null,
  isLoading: false,
  hasMore: true,
  offset: 0,

  setSort: (sort) => {
    set({ sort, posts: [], offset: 0, hasMore: true });
    get().loadPosts(true);
  },

  setTimeRange: (timeRange) => {
    set({ timeRange, posts: [], offset: 0, hasMore: true });
    get().loadPosts(true);
  },

  setSubseeq: (subseeq) => {
    set({ subseeq, posts: [], offset: 0, hasMore: true });
    get().loadPosts(true);
  },

  loadPosts: async (reset = false) => {
    const { sort, timeRange, subseeq, isLoading } = get();
    if (isLoading) return;

    set({ isLoading: true });
    try {
      const offset = reset ? 0 : get().offset;
      const response = subseeq
        ? await api.getSubseeqFeed(subseeq, { sort, limit: 25, offset })
        : await api.getPosts({ sort, timeRange, limit: 25, offset });
      
      set({
        posts: reset ? response.data : [...get().posts, ...response.data],
        hasMore: response.pagination.hasMore,
        offset: offset + response.data.length,
        isLoading: false,
      });
    } catch (err) {
      set({ isLoading: false });
      console.error('Failed to load posts:', err);
    }
  },
  
  loadMore: async () => {
    const { hasMore, isLoading } = get();
    if (!hasMore || isLoading) return;
    await get().loadPosts();
  },
  
  updatePostVote: (postId, vote, scoreDiff) => {
    set({
      posts: get().posts.map(p => 
        p.id === postId ? { ...p, userVote: vote, score: p.score + scoreDiff } : p
      ),
    });
  },
}));

// UI Store
interface UIStore {
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  createPostOpen: boolean;
  createPostSubseeq: string | null;
  searchOpen: boolean;

  toggleSidebar: () => void;
  toggleMobileMenu: () => void;
  openCreatePost: (subseeq?: string) => void;
  closeCreatePost: () => void;
  openSearch: () => void;
  closeSearch: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarOpen: true,
  mobileMenuOpen: false,
  createPostOpen: false,
  createPostSubseeq: null,
  searchOpen: false,

  toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),
  toggleMobileMenu: () => set(s => ({ mobileMenuOpen: !s.mobileMenuOpen })),
  openCreatePost: (subseeq?) => set({ createPostOpen: true, createPostSubseeq: subseeq || null }),
  closeCreatePost: () => set({ createPostOpen: false, createPostSubseeq: null }),
  openSearch: () => set({ searchOpen: true }),
  closeSearch: () => set({ searchOpen: false }),
}));

// Notifications Store
interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  
  loadNotifications: () => Promise<void>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clear: () => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  
  loadNotifications: async () => {
    set({ isLoading: true });
    // TODO: Implement API call
    set({ isLoading: false });
  },
  
  markAsRead: (id) => {
    set({
      notifications: get().notifications.map(n => n.id === id ? { ...n, read: true } : n),
      unreadCount: Math.max(0, get().unreadCount - 1),
    });
  },
  
  markAllAsRead: () => {
    set({
      notifications: get().notifications.map(n => ({ ...n, read: true })),
      unreadCount: 0,
    });
  },
  
  clear: () => set({ notifications: [], unreadCount: 0 }),
}));

// Subscriptions Store
interface SubscriptionStore {
  subscribedSubseeqs: string[];
  addSubscription: (name: string) => void;
  removeSubscription: (name: string) => void;
  isSubscribed: (name: string) => boolean;
}

export const useSubscriptionStore = create<SubscriptionStore>()(
  persist(
    (set, get) => ({
      subscribedSubseeqs: [],

      addSubscription: (name) => {
        if (!get().subscribedSubseeqs.includes(name)) {
          set({ subscribedSubseeqs: [...get().subscribedSubseeqs, name] });
        }
      },

      removeSubscription: (name) => {
        set({ subscribedSubseeqs: get().subscribedSubseeqs.filter(s => s !== name) });
      },

      isSubscribed: (name) => get().subscribedSubseeqs.includes(name),
    }),
    { name: 'seeqit-subscriptions' }
  )
);
