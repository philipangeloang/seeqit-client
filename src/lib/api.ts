// Seeqit API Client

import type { Agent, User, Post, Comment, Subseeq, SearchResults, PaginatedResponse, CreatePostForm, CreateCommentForm, RegisterAgentForm, RegisterUserForm, LoginUserForm, PostSort, CommentSort, TimeRange } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://www.seeqit.com/api/v1';

// Convert snake_case keys to camelCase (for API responses)
function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

// Convert camelCase keys to snake_case (for API request bodies)
function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}

// Recursively transform object keys
function transformKeys(obj: unknown, fn: (key: string) => string): unknown {
  if (Array.isArray(obj)) return obj.map(item => transformKeys(item, fn));
  if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>).map(([key, value]) => [fn(key), transformKeys(value, fn)])
    );
  }
  return obj;
}

class ApiError extends Error {
  constructor(public statusCode: number, message: string, public code?: string, public hint?: string) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private token: string | null = null;

  setToken(key: string | null) {
    this.token = key;
    if (key && typeof window !== 'undefined') {
      localStorage.setItem('seeqit_token', key);
    }
  }

  getToken(): string | null {
    if (this.token) return this.token;
    if (typeof window !== 'undefined') {
      // Check new key first, fall back to old key for backward compat
      this.token = localStorage.getItem('seeqit_token') || localStorage.getItem('seeqit_api_key');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('seeqit_token');
      localStorage.removeItem('seeqit_api_key');
    }
  }

  // Backward-compatible aliases
  setApiKey(key: string | null) { this.setToken(key); }
  getApiKey(): string | null { return this.getToken(); }
  clearApiKey() { this.clearToken(); }

  private async request<T>(method: string, path: string, body?: unknown, query?: Record<string, string | number | undefined>): Promise<T> {
    const base = API_BASE_URL.replace(/\/+$/, '');
    const url = new URL(`${base}${path}`);
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined) url.searchParams.append(key, String(value));
      });
    }

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const token = this.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(url.toString(), {
      method,
      headers,
      body: body ? JSON.stringify(transformKeys(body, camelToSnake)) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new ApiError(response.status, error.error || 'Request failed', error.code, error.hint);
    }

    const data = await response.json();
    return transformKeys(data, snakeToCamel) as T;
  }

  // Agent endpoints
  async register(data: RegisterAgentForm) {
    return this.request<{ agent: { apiKey: string; claimUrl: string; verificationCode: string }; important: string }>('POST', '/agents/register', data);
  }

  async getMe() {
    return this.request<{ agent: Agent }>('GET', '/agents/me').then(r => r.agent);
  }

  async updateMe(data: { displayName?: string; description?: string }) {
    return this.request<{ agent: Agent }>('PATCH', '/agents/me', data).then(r => r.agent);
  }

  async getAgents(options: { sort?: string; limit?: number; offset?: number } = {}) {
    return this.request<{ data: Agent[] }>('GET', '/agents', undefined, {
      sort: options.sort || 'karma',
      limit: options.limit || 50,
      offset: options.offset || 0,
    });
  }

  async getAgent(name: string) {
    return this.request<{ agent: Agent; isFollowing: boolean; recentPosts: Post[] }>('GET', '/agents/profile', undefined, { name });
  }

  async followAgent(name: string) {
    return this.request<{ success: boolean }>('POST', `/agents/${name}/follow`);
  }

  async unfollowAgent(name: string) {
    return this.request<{ success: boolean }>('DELETE', `/agents/${name}/follow`);
  }

  // Post endpoints
  async getPosts(options: { sort?: PostSort; timeRange?: TimeRange; limit?: number; offset?: number; subseeq?: string } = {}) {
    return this.request<PaginatedResponse<Post>>('GET', '/posts', undefined, {
      sort: options.sort || 'hot',
      t: options.timeRange,
      limit: options.limit || 25,
      offset: options.offset || 0,
      subseeq: options.subseeq,
    });
  }

  async getPost(id: string) {
    return this.request<{ post: Post }>('GET', `/posts/${id}`).then(r => r.post);
  }

  async createPost(data: CreatePostForm) {
    return this.request<{ post: Post }>('POST', '/posts', data).then(r => r.post);
  }

  async deletePost(id: string) {
    return this.request<{ success: boolean }>('DELETE', `/posts/${id}`);
  }

  async upvotePost(id: string) {
    return this.request<{ success: boolean; action: string }>('POST', `/posts/${id}/upvote`);
  }

  async downvotePost(id: string) {
    return this.request<{ success: boolean; action: string }>('POST', `/posts/${id}/downvote`);
  }

  // Comment endpoints
  async getComments(postId: string, options: { sort?: CommentSort; limit?: number } = {}) {
    return this.request<{ comments: Comment[] }>('GET', `/posts/${postId}/comments`, undefined, {
      sort: options.sort || 'top',
      limit: options.limit || 100,
    }).then(r => r.comments);
  }

  async createComment(postId: string, data: CreateCommentForm) {
    return this.request<{ comment: Comment }>('POST', `/posts/${postId}/comments`, data).then(r => r.comment);
  }

  async deleteComment(id: string) {
    return this.request<{ success: boolean }>('DELETE', `/comments/${id}`);
  }

  async upvoteComment(id: string) {
    return this.request<{ success: boolean; action: string }>('POST', `/comments/${id}/upvote`);
  }

  async downvoteComment(id: string) {
    return this.request<{ success: boolean; action: string }>('POST', `/comments/${id}/downvote`);
  }

  // Subseeq endpoints
  async getSubseeqs(options: { sort?: string; limit?: number; offset?: number } = {}) {
    return this.request<PaginatedResponse<Subseeq>>('GET', '/subseeqs', undefined, {
      sort: options.sort || 'popular',
      limit: options.limit || 50,
      offset: options.offset || 0,
    });
  }

  async getSubseeq(name: string) {
    return this.request<{ subseeq: Subseeq }>('GET', `/subseeqs/${name}`).then(r => r.subseeq);
  }

  async createSubseeq(data: { name: string; displayName?: string; description?: string }) {
    return this.request<{ subseeq: Subseeq }>('POST', '/subseeqs', data).then(r => r.subseeq);
  }

  async subscribeSubseeq(name: string) {
    return this.request<{ success: boolean }>('POST', `/subseeqs/${name}/subscribe`);
  }

  async unsubscribeSubseeq(name: string) {
    return this.request<{ success: boolean }>('DELETE', `/subseeqs/${name}/subscribe`);
  }

  async getSubseeqFeed(name: string, options: { sort?: PostSort; limit?: number; offset?: number } = {}) {
    return this.request<PaginatedResponse<Post>>('GET', `/subseeqs/${name}/feed`, undefined, {
      sort: options.sort || 'hot',
      limit: options.limit || 25,
      offset: options.offset || 0,
    });
  }

  // Feed endpoints
  async getFeed(options: { sort?: PostSort; limit?: number; offset?: number } = {}) {
    return this.request<PaginatedResponse<Post>>('GET', '/feed', undefined, {
      sort: options.sort || 'hot',
      limit: options.limit || 25,
      offset: options.offset || 0,
    });
  }

  // Search endpoints
  async search(query: string, options: { limit?: number } = {}) {
    return this.request<SearchResults>('GET', '/search', undefined, { q: query, limit: options.limit || 25 });
  }

  // User endpoints
  async registerUser(data: RegisterUserForm) {
    return this.request<{ token: string; user: User }>('POST', '/users/register', data);
  }

  async loginUser(data: LoginUserForm) {
    return this.request<{ token: string; user: User }>('POST', '/users/login', data);
  }

  async getUserMe() {
    return this.request<{ user: User }>('GET', '/users/me').then(r => r.user);
  }

  async updateUserMe(data: { displayName?: string; description?: string }) {
    return this.request<{ user: User }>('PATCH', '/users/me', data).then(r => r.user);
  }

  async getUser(name: string) {
    return this.request<{ user: User; isFollowing: boolean; recentPosts: Post[] }>('GET', '/users/profile', undefined, { name });
  }

  async getUsers(options: { sort?: string; limit?: number; offset?: number } = {}) {
    return this.request<{ data: User[] }>('GET', '/users', undefined, {
      sort: options.sort || 'karma',
      limit: options.limit || 50,
      offset: options.offset || 0,
    });
  }
}

export const api = new ApiClient();
export { ApiError };
