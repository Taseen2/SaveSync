export const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

export const appState = {
  notes: [],
  activeFilter: 'all',
  activeSort: 'manual',
  currentSearch: '',
  pendingDeleteId: null,
  lastDeletedNote: null,
  lastChangedId: null,
  draggedId: null,
  lastRenderSignature: '',
  lastStats: { total: 0, pinned: 0, favorites: 0, archived: 0 },
  selectedIds: new Set(),
  prefersReducedMotion: motionQuery.matches
};
