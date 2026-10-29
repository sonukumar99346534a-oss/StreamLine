import React, { useState } from 'react';
import { 
  Send, 
  Bookmark, 
  Trash2, 
  Edit3, 
  Search, 
  Zap, 
  CheckCircle, 
  AlertCircle, 
  BarChart3, 
  History, 
  Layers, 
  RotateCcw,
  Plus
} from 'lucide-react';
import { PostDraft, PostItem, SocialPlatform, User } from '../types';
import { 
  PostsState, 
  MemoizedSelectorTracker, 
  selectTotalPosts, 
  selectShortPosts, 
  selectLongPosts, 
  selectFilteredPosts 
} from '../services/storeService';

interface ComposerAndReduxProps {
  state: PostsState;
  dispatch: (action: { type: string; payload?: any }) => void;
  currentUser: User;
}

export const ComposerAndRedux: React.FC<ComposerAndReduxProps> = ({
  state,
  dispatch,
  currentUser,
}) => {
  // Exp 1.1 Composer state
  const [platform, setPlatform] = useState<SocialPlatform>('Twitter');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'Tech' | 'Design' | 'DevOps' | 'AI' | 'Cloud'>('Tech');
  const [editingPostId, setEditingPostId] = useState<string | null>(null);

  // Platform limits from Exp 1.1 + extension
  const platformLimits: Record<SocialPlatform, number> = {
    Twitter: 280,
    LinkedIn: 3000,
    Instagram: 2200,
    Threads: 500,
  };

  const limit = platformLimits[platform];
  const charCount = content.length;
  const isExceeded = charCount > limit;
  const charPercent = Math.min(100, Math.round((charCount / limit) * 100));

  // Exp 2.2 Memoized Selector calls
  const totalPosts = selectTotalPosts(state);
  const shortPosts = selectShortPosts(state);
  const longPosts = selectLongPosts(state);
  const { posts: filteredPosts, recalculated, durationUs } = selectFilteredPosts(state);

  // Handle Save Draft (Exp 1.2)
  const handleSaveDraft = () => {
    if (!content.trim()) return;
    const newDraft: PostDraft = {
      id: 'draft-' + Date.now(),
      platform,
      category,
      content,
      savedAt: Date.now(),
    };
    dispatch({ type: 'drafts/saveDraft', payload: newDraft });
    setContent('');
    setTitle('');
  };

  // Handle Edit/Load Draft (Exp 1.2)
  const handleLoadDraft = (draft: PostDraft) => {
    setContent(draft.content);
    setPlatform(draft.platform);
    setCategory(draft.category);
    dispatch({ type: 'drafts/deleteDraft', payload: draft.id });
  };

  // Handle Publish / Add Post (Exp 2.1)
  const handlePublishPost = () => {
    if (!content.trim() || isExceeded) return;
    const postTitle = title.trim() || content.substring(0, 35) + '...';

    if (editingPostId) {
      dispatch({
        type: 'posts/updatePost',
        payload: {
          id: editingPostId,
          title: postTitle,
          content,
          platform,
          category,
        },
      });
      setEditingPostId(null);
    } else {
      const newPost: PostItem = {
        id: 'post-' + Date.now(),
        title: postTitle,
        content,
        platform,
        category,
        createdAt: Date.now(),
        likes: 0,
        views: 1,
        authorId: currentUser.id,
        authorName: currentUser.name,
      };
      dispatch({ type: 'posts/addPost', payload: newPost });
    }

    setContent('');
    setTitle('');
  };

  const handleEditPost = (post: PostItem) => {
    setEditingPostId(post.id);
    setTitle(post.title);
    setContent(post.content);
    setPlatform(post.platform);
    setCategory(post.category);
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded font-semibold">
              EXPERIMENTS 1.1, 1.2, 2.1 & 2.2
            </span>
            <span className="text-xs text-slate-400">Synthesis Module 1</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Multi-Platform Post Composer & Reselect State Engine
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Real-time character constraints validation, LocalStorage draft retention, Redux Toolkit actions, and memoized selectors.
          </p>
        </div>

        {/* Reselect Metrics Widget */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center gap-5">
          <div className="text-center">
            <div className="text-[10px] uppercase text-slate-400 font-mono">Reselect Cache Hits</div>
            <div className="text-xl font-bold font-mono text-emerald-400">
              {MemoizedSelectorTracker.cacheHits}
            </div>
          </div>
          <div className="h-8 w-px bg-slate-800"></div>
          <div className="text-center">
            <div className="text-[10px] uppercase text-slate-400 font-mono">Recomputations</div>
            <div className="text-xl font-bold font-mono text-amber-400">
              {MemoizedSelectorTracker.recomputations}
            </div>
          </div>
          <div className="h-8 w-px bg-slate-800"></div>
          <div className="text-center">
            <div className="text-[10px] uppercase text-slate-400 font-mono">Calc Latency</div>
            <div className="text-xl font-bold font-mono text-cyan-400">{durationUs} µs</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Post Composer & Drafts (Exp 1.1 & 1.2) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-400" />
                {editingPostId ? 'Edit Existing Post' : 'Social Media Post Composer'}
              </h3>
              {editingPostId && (
                <button
                  onClick={() => {
                    setEditingPostId(null);
                    setTitle('');
                    setContent('');
                  }}
                  className="text-xs text-rose-400 hover:underline flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Cancel Edit
                </button>
              )}
            </div>

            {/* Platform Selector (Exp 1.1) */}
            <div className="space-y-2 mb-4">
              <label className="text-xs font-semibold text-slate-300">Select Target Platform</label>
              <div className="grid grid-cols-4 gap-2">
                {(['Twitter', 'LinkedIn', 'Instagram', 'Threads'] as SocialPlatform[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPlatform(p)}
                    className={`py-2 px-2 text-xs font-semibold rounded-lg border text-center transition ${
                      platform === p
                        ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20'
                        : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Title Input */}
            <div className="space-y-1 mb-4">
              <label className="text-xs font-semibold text-slate-300">Post Title / Headline (Optional)</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Scaling Kafka consumer partitions..."
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Content Textarea (Exp 1.1) */}
            <div className="space-y-1 mb-3">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-slate-300">Post Content</label>
                <span className="font-mono text-slate-400">
                  {charCount} / <strong className="text-slate-200">{limit}</strong> chars
                </span>
              </div>
              <textarea
                rows={5}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`Type your ${platform} message here...`}
                className={`w-full bg-slate-950 border rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition ${
                  isExceeded ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-700 focus:border-blue-500'
                }`}
              />
            </div>

            {/* Real-time Character Constraint Meter & Validation Badge (Exp 1.1) */}
            <div className="space-y-2 mb-6">
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    isExceeded
                      ? 'bg-rose-500'
                      : charPercent > 80
                      ? 'bg-amber-400'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${charPercent}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between text-xs">
                {isExceeded ? (
                  <span className="flex items-center gap-1.5 text-rose-400 font-semibold">
                    <AlertCircle className="w-4 h-4" />
                    Character Limit Exceeded! (-{charCount - limit} over quota)
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <CheckCircle className="w-4 h-4" />
                    Ready to Post ({limit - charCount} chars remaining)
                  </span>
                )}
                <span className="text-slate-500 font-mono text-[11px]">{charPercent}% Quota</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handlePublishPost}
                disabled={!content.trim() || isExceeded}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition"
              >
                <Send className="w-4 h-4" />
                <span>{editingPostId ? 'Update in Redux' : 'Publish Post (Redux)'}</span>
              </button>
              <button
                onClick={handleSaveDraft}
                disabled={!content.trim()}
                title="Save Draft into Local Storage"
                className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 border border-slate-700 text-xs font-semibold transition"
              >
                <Bookmark className="w-4 h-4 text-amber-400" />
                <span>Save Draft</span>
              </button>
            </div>
          </div>

          {/* Draft Management Section (Exp 1.2) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-amber-400" />
                <h4 className="font-bold text-slate-200 text-sm">Saved Drafts (LocalStorage)</h4>
              </div>
              <span className="text-xs font-mono bg-slate-800 text-amber-300 px-2 py-0.5 rounded-full">
                {state.drafts.length} drafts
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Loaded dynamically on start via <code className="text-indigo-300">useEffect()</code>. Drafts persist across browser reloads.
            </p>

            {state.drafts.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
                No active drafts in localStorage. Write a post above and click "Save Draft".
              </div>
            ) : (
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {state.drafts.map((draft) => (
                  <div
                    key={draft.id}
                    className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl hover:border-slate-700 transition flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold font-mono px-1.5 py-0.2 rounded bg-blue-950 text-blue-300 border border-blue-900">
                          {draft.platform}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {new Date(draft.savedAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 line-clamp-2">{draft.content}</p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleLoadDraft(draft)}
                        title="Load into Composer"
                        className="p-1.5 rounded-lg hover:bg-blue-500/20 text-slate-400 hover:text-blue-300 transition"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => dispatch({ type: 'drafts/deleteDraft', payload: draft.id })}
                        title="Delete Draft"
                        className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Redux Store & Reselect Dashboard (Exp 2.1 & 2.2) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Memoized Reselect Stats Bar */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gradient-to-br from-blue-950/60 to-slate-900 border border-blue-500/30 p-4 rounded-xl text-center shadow-lg">
              <div className="text-2xl font-extrabold text-blue-400 font-mono">{totalPosts}</div>
              <div className="text-xs text-slate-400 font-medium mt-1">Total Posts (Redux)</div>
            </div>
            <div className="bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-500/30 p-4 rounded-xl text-center shadow-lg">
              <div className="text-2xl font-extrabold text-emerald-400 font-mono">{shortPosts.length}</div>
              <div className="text-xs text-slate-400 font-medium mt-1">Short Posts (&lt; 80 chars)</div>
            </div>
            <div className="bg-gradient-to-br from-amber-950/60 to-slate-900 border border-amber-500/30 p-4 rounded-xl text-center shadow-lg">
              <div className="text-2xl font-extrabold text-amber-400 font-mono">{longPosts.length}</div>
              <div className="text-xs text-slate-400 font-medium mt-1">Long Posts (&ge; 80 chars)</div>
            </div>
          </div>

          {/* Search & Filter Controls (Exp 2.2) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={state.searchQuery}
                  onChange={(e) => dispatch({ type: 'posts/setSearchQuery', payload: e.target.value })}
                  placeholder="🔍 Search posts by title or keyword..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Filter Buttons (Exp 2.2) */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {(['all', 'short', 'long', 'Twitter', 'LinkedIn'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => dispatch({ type: 'posts/setActiveFilter', payload: f })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                      state.activeFilter === f
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Derived Posts List (useSelector & createSelector output) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>Displaying {filteredPosts.length} filtered items</span>
                <span className="font-mono text-cyan-300">
                  {recalculated ? '⚡ Recomputed' : '✓ Served from Selector Cache'}
                </span>
              </div>

              {filteredPosts.length === 0 ? (
                <div className="text-center py-10 bg-slate-950/60 rounded-xl border border-slate-800 text-slate-500 text-sm">
                  No matching posts found.
                </div>
              ) : (
                <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                  {filteredPosts.map((post) => (
                    <div
                      key={post.id}
                      className="p-4 bg-slate-950/70 border border-slate-800 hover:border-slate-700 rounded-xl transition flex flex-col justify-between gap-3 group"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-100">{post.title}</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                              {post.platform}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-900">
                              {post.category}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {post.content.length} chars
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{post.content}</p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                        <span className="text-[11px] text-slate-500 font-mono">
                          Author: {post.authorName}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditPost(post)}
                            className="text-xs px-2.5 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-medium transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => dispatch({ type: 'posts/deletePost', payload: post.id })}
                            className="text-xs px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-medium transition"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Redux Action Dispatcher Log (Exp 2.1 inspection) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-indigo-400" />
                Redux Action Dispatch Stream
              </h4>
              <button
                onClick={() => dispatch({ type: 'posts/clearActionLog' })}
                className="text-[11px] text-slate-500 hover:text-slate-300"
              >
                Clear Log
              </button>
            </div>
            <div className="space-y-1.5 font-mono text-xs max-h-32 overflow-y-auto">
              {state.actionLog.map((log) => (
                <div key={log.id} className="p-2 rounded bg-slate-950 border border-slate-800/60 flex items-center justify-between">
                  <span className="text-indigo-400 font-semibold">{log.type}</span>
                  <span className="text-slate-400 truncate max-w-[240px] text-[11px]">{log.payloadPreview}</span>
                  <span className="text-[10px] text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
