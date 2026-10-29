/**
 * Redux-Style Store & Reselect Memoization Engine
 * Synthesizing Experiment 2.1 (Redux Store & CRUD reducers)
 * and Experiment 2.2 (createSelector memoization & derived state optimization)
 * and Experiment 1.2 (Draft Management with localStorage sync)
 */

import { PostDraft, PostItem, SocialPlatform } from '../types';

export interface PostsState {
  items: PostItem[];
  drafts: PostDraft[];
  searchQuery: string;
  activeFilter: 'all' | 'short' | 'long' | SocialPlatform;
  actionLog: {
    id: string;
    type: string;
    timestamp: number;
    payloadPreview: string;
  }[];
}

const INITIAL_POSTS: PostItem[] = [
  {
    id: 'post-1',
    title: 'Deploying Spring Boot with Kafka & DLQ on Kubernetes',
    content: 'Mastering distributed event resilience with retry backoff and dead-letter queues ensures reliable order processing under peak microservice load. #FullStack #Kafka',
    platform: 'LinkedIn',
    category: 'DevOps',
    createdAt: Date.now() - 3600000 * 24,
    likes: 142,
    views: 1205,
    authorId: '24BAI70827',
    authorName: 'Kanishk Jamwal',
  },
  {
    id: 'post-2',
    title: 'React 19 & Redux Toolkit state normalization',
    content: 'Zero prop-drilling with memoized createSelector selectors. Instant re-render reduction and lightning fast derived state calculations.',
    platform: 'Twitter',
    category: 'Tech',
    createdAt: Date.now() - 3600000 * 12,
    likes: 89,
    views: 890,
    authorId: '24BAI70898',
    authorName: 'Hari Krishan',
  },
  {
    id: 'post-3',
    title: 'Zero-Trust JWT with AES-GCM credential vault',
    content: 'Never store 3P OAuth tokens in plaintext. AES-GCM with 12-byte nonce guarantees data authenticity alongside short-lived JWT access tokens.',
    platform: 'LinkedIn',
    category: 'Cloud',
    createdAt: Date.now() - 3600000 * 5,
    likes: 64,
    views: 450,
    authorId: '24BAI70827',
    authorName: 'Kanishk Jamwal',
  },
  {
    id: 'post-4',
    title: 'UI Design Constitution',
    content: 'Elevating student labs with enterprise aesthetics.',
    platform: 'Twitter',
    category: 'Design',
    createdAt: Date.now() - 3600000 * 2,
    likes: 31,
    views: 310,
    authorId: '24BAI70898',
    authorName: 'Hari Krishan',
  },
  {
    id: 'post-5',
    title: 'Canary Deployments with Cloud Run',
    content: 'Gradual 10% traffic shifting to new revision tags with automated smoke testing and instant zero-downtime rollback if health checks fail.',
    platform: 'LinkedIn',
    category: 'DevOps',
    createdAt: Date.now() - 3600000,
    likes: 110,
    views: 940,
    authorId: '24BAI70827',
    authorName: 'Kanishk Jamwal',
  },
];

const INITIAL_DRAFTS: PostDraft[] = [
  {
    id: 'draft-1',
    platform: 'Twitter',
    category: 'Tech',
    content: 'Experiment 10 capstone combining all 9 lab experiments into a single unified architecture.',
    savedAt: Date.now() - 1800000,
  },
  {
    id: 'draft-2',
    platform: 'LinkedIn',
    category: 'Cloud',
    content: 'Chandigarh University CSE-AIML 5th Sem Full Stack - II comprehensive submission notes.',
    savedAt: Date.now() - 900000,
  },
];

// LocalStorage Persistence Keys (as in Exp 1.2)
const STORAGE_POSTS_KEY = 'cu_exp10_posts_v1';
const STORAGE_DRAFTS_KEY = 'cu_exp10_drafts_v1';

export function loadInitialState(): PostsState {
  let items = INITIAL_POSTS;
  let drafts = INITIAL_DRAFTS;

  try {
    const savedPosts = localStorage.getItem(STORAGE_POSTS_KEY);
    if (savedPosts) items = JSON.parse(savedPosts);
    const savedDrafts = localStorage.getItem(STORAGE_DRAFTS_KEY);
    if (savedDrafts) drafts = JSON.parse(savedDrafts);
  } catch (err) {
    console.warn('Storage read fallback:', err);
  }

  return {
    items,
    drafts,
    searchQuery: '',
    activeFilter: 'all',
    actionLog: [
      {
        id: 'init-1',
        type: 'posts/initializeStore',
        timestamp: Date.now(),
        payloadPreview: `Loaded ${items.length} posts, ${drafts.length} drafts`,
      },
    ],
  };
}

export function saveStateToStorage(items: PostItem[], drafts: PostDraft[]) {
  try {
    localStorage.setItem(STORAGE_POSTS_KEY, JSON.stringify(items));
    localStorage.setItem(STORAGE_DRAFTS_KEY, JSON.stringify(drafts));
  } catch (err) {
    console.error('Storage write error:', err);
  }
}

/**
 * Reselect Memoization Simulation (Exp 2.2)
 * Tracks actual selector executions vs cached memoization returns
 */
export class MemoizedSelectorTracker {
  static recomputations = 0;
  static cacheHits = 0;
  private static lastStateRef: PostsState | null = null;
  private static cachedResults: Record<string, unknown> = {};

  static clearMetrics() {
    this.recomputations = 0;
    this.cacheHits = 0;
    this.lastStateRef = null;
    this.cachedResults = {};
  }
}

// Selector 1: Total Posts
export function selectTotalPosts(state: PostsState): number {
  return state.items.length;
}

// Selector 2: Short Posts (Content or Title length < 80 characters, as in Exp 2.2)
export function selectShortPosts(state: PostsState): PostItem[] {
  return state.items.filter((p) => p.title.length < 35 || p.content.length < 80);
}

// Selector 3: Long Posts (Length >= 80 characters)
export function selectLongPosts(state: PostsState): PostItem[] {
  return state.items.filter((p) => p.title.length >= 35 || p.content.length >= 80);
}

// Selector 4: Memoized Filtered & Searched Posts with Performance Metrics
export function selectFilteredPosts(state: PostsState): {
  posts: PostItem[];
  recalculated: boolean;
  durationUs: number;
} {
  const startTime = performance.now();
  const cacheKey = `${state.searchQuery}__${state.activeFilter}__${state.items.map((i) => i.id + i.title).join('|')}`;

  const cached = (MemoizedSelectorTracker as any).cachedResults?.[cacheKey];
  if (cached) {
    MemoizedSelectorTracker.cacheHits++;
    const duration = Math.round((performance.now() - startTime) * 1000);
    return {
      posts: cached as PostItem[],
      recalculated: false,
      durationUs: duration,
    };
  }

  // Derived state computation
  MemoizedSelectorTracker.recomputations++;
  let result = state.items;

  if (state.activeFilter === 'short') {
    result = selectShortPosts(state);
  } else if (state.activeFilter === 'long') {
    result = selectLongPosts(state);
  } else if (['Twitter', 'LinkedIn', 'Instagram', 'Threads'].includes(state.activeFilter)) {
    result = result.filter((p) => p.platform === state.activeFilter);
  }

  if (state.searchQuery.trim()) {
    const q = state.searchQuery.toLowerCase();
    result = result.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }

  if (!(MemoizedSelectorTracker as any).cachedResults) {
    (MemoizedSelectorTracker as any).cachedResults = {};
  }
  (MemoizedSelectorTracker as any).cachedResults[cacheKey] = result;

  const duration = Math.round((performance.now() - startTime) * 1000);
  return {
    posts: result,
    recalculated: true,
    durationUs: duration,
  };
}
