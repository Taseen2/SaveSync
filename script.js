/**
 * SECTION: CONFIGURATION & CONSTANTS
 * We start by defining our storage keys, constants, and UI copy.
 */
const STORAGE_KEYS = {
  notes: 'smart-notes-app-notes',
  theme: 'smart-notes-app-theme',
  draft: 'smart-notes-app-draft'
};

const COLOR_NAMES = ['cyan', 'violet', 'amber', 'rose', 'emerald'];

const FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'pinned', label: 'Pinned' },
  { value: 'favorites', label: 'Favorites' },
  { value: 'archived', label: 'Archived' },
  { value: 'recent', label: 'Recent' },
  { value: 'trash', label: 'Trash' }
];

const SORT_OPTIONS = [
  { value: 'manual', label: 'Custom' },
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'az', label: 'A-Z' }
];

const EMPTY_STATE_COPY = {
  all: {
    title: 'No notes yet.',
    detail: 'Start with a title and a few lines in the composer above.'
  },
  pinned: {
    title: 'No pinned notes yet.',
    detail: 'Pin important notes to keep them close at hand.'
  },
  favorites: {
    title: 'No favorite notes yet.',
    detail: 'Star notes you revisit often to find them faster.'
  },
  archived: {
    title: 'No archived notes yet.',
    detail: 'Archived notes will stay tucked away here.'
  },
  recent: {
    title: 'No recently updated notes.',
    detail: 'Edit a note and it will appear here for the next 7 days.'
  },
  trash: {
    title: 'Trash is empty.',
    detail: 'Deleted notes can be restored here until you remove them forever.'
  },
  search: {
    title: 'No notes match your search.',
    detail: 'Try a different keyword or clear a filter.'
  }
};

const FORM_COPY = {
  createTitle: 'Create a note',
  createMode: 'Drafts auto-save while you type.',
  recoveredMode: 'Draft recovered from your last session.',
  editTitle: 'Edit note',
  editMode: 'Update the note and keep your latest changes in place.'
};

const TOAST_COPY = {
  missingDetail: {
    title: 'Missing detail',
    message: 'Add a title and note body before saving.'
  },
  composerCleared: {
    title: 'Composer cleared',
    message: 'Draft fields have been reset.'
  },
  editCancelled: {
    title: 'Edit cancelled',
    message: 'Composer reset.'
  },
  noteUpdated: {
    title: 'Note updated',
    message: 'Your changes were saved.'
  },
  noteAdded: {
    title: 'Note added',
    message: 'Your note is now in the workspace.'
  },
  noteDuplicated: {
    title: 'Note duplicated',
    message: 'A fresh copy was added.'
  },
  copied: {
    title: 'Copied',
    message: 'Note text copied to clipboard.'
  },
  exportReady: {
    title: 'Export ready',
    message: 'Your notes were downloaded as JSON.'
  },
  importFailed: {
    title: 'Import failed',
    message: 'Choose a valid Smart Notes JSON file.'
  },
  orderUpdated: {
    title: 'Order updated',
    message: 'Custom note order saved.'
  },
  orderManualOnly: {
    title: 'Custom sort required',
    message: 'Switch to Custom sort to reorder notes.'
  },
  deleteUndone: {
    title: 'Delete undone',
    message: 'Your note is back.'
  },
  noteDeletedForever: {
    title: 'Note deleted forever',
    message: 'It was removed from storage.'
  },
  movedToTrash: {
    title: 'Moved to trash',
    message: 'You can restore it from the Trash filter.'
  },
  themeUpdated(nextTheme) {
    return {
      title: 'Theme updated',
      message: `${nextTheme === 'dark' ? 'Dark' : 'Light'} mode enabled.`
    };
  },
  importSummary(importedCount, skippedCount) {
    if (importedCount === 0) {
      return {
        title: 'No new notes imported',
        message: skippedCount
          ? `${skippedCount} duplicate or invalid entries were skipped.`
          : 'The file did not contain any new notes.'
      };
    }

    return {
      title: 'Import complete',
      message: skippedCount
        ? `${importedCount} notes added, ${skippedCount} skipped.`
        : `${importedCount} notes imported.`
    };
  }
};

const MODAL_COPY = {
  trash: {
    title: 'Move this note to trash?',
    message: 'This moves the note out of your workspace. You can restore it from Trash.'
  },
  permanent: {
    title: 'Delete forever?',
    message: 'This permanently removes the note from LocalStorage.'
  }
};

/**
 * SECTION: DOM SELECTORS
 * Centralized DOM references.
 */
const dom = {
  appShell: document.getElementById('app-shell'),
  loader: document.getElementById('startup-loader'),
  composer: document.getElementById('composer'),
  noteForm: document.getElementById('note-form'),
  noteIdInput: document.getElementById('note-id'),
  titleInput: document.getElementById('note-title'),
  categoryInput: document.getElementById('note-category'),
  bodyInput: document.getElementById('note-body'),
  saveButton: document.getElementById('save-note'),
  cancelEditButton: document.getElementById('cancel-edit'),
  composerTitle: document.getElementById('composer-title'),
  formMode: document.getElementById('form-mode'),
  previewPanel: document.getElementById('markdown-preview'),
  controlsSection: document.querySelector('.controls'),
  searchInput: document.getElementById('search-notes'),
  sortSelect: document.getElementById('sort-notes'),
  filterGroup: document.getElementById('filter-group'),
  pinnedSection: document.getElementById('pinned-section'),
  pinnedNotesContainer: document.getElementById('pinned-notes'),
  notesContainer: document.getElementById('notes-container'),
  emptyState: document.getElementById('empty-state'),
  notesCount: document.getElementById('notes-count'),
  themeToggle: document.getElementById('theme-toggle'),
  themeIcon: document.querySelector('#theme-toggle .theme-icon'),
  toastStack: document.getElementById('toast-stack'),
  deleteModal: document.getElementById('delete-modal'),
  deleteTitle: document.getElementById('delete-title'),
  deleteText: document.getElementById('delete-text'),
  readModal: document.getElementById('read-modal'),
  readTitle: document.getElementById('read-title'),
  readBody: document.getElementById('read-body'),
  readBadges: document.getElementById('read-badges'),
  readMeta: document.getElementById('read-meta'),
  importFile: document.getElementById('import-file'),
  bulkToolbar: document.getElementById('bulk-toolbar'),
  selectedCount: document.getElementById('selected-count'),
  cursorGlow: document.getElementById('cursor-glow'),
  statEls: {
    total: document.getElementById('total-stat'),
    pinned: document.getElementById('pinned-stat'),
    favorites: document.getElementById('favorite-stat'),
    archived: document.getElementById('archived-stat')
  }
};

/**
 * SECTION: APPLICATION STATE
 */
const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

let isResetting = false;

const appState = {
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

/**
 * SECTION: UTILITY FUNCTIONS
 */
function createId() {
  if (window.crypto && typeof window.crypto.randomUUID === 'function') {
    return window.crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function debounce(callback, delay = 180) {
  let timerId;
  return (...args) => {
    window.clearTimeout(timerId);
    timerId = window.setTimeout(() => callback(...args), delay);
  };
}

function getWordCount(text) {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

function formatDate(dateValue) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(new Date(dateValue));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function renderMarkdown(text) {
  const safeText = escapeHtml(text);
  return safeText
    .replace(/^### (.*)$/gm, '<h4>$1</h4>')
    .replace(/^## (.*)$/gm, '<h3>$1</h3>')
    .replace(/^# (.*)$/gm, '<h2>$1</h2>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/^- (.*)$/gm, '<div class="md-list-item">$1</div>')
    .replace(/\n/g, '<br>');
}

/**
 * SECTION: STORAGE & DATA PERSISTENCE
 */
function normalizeNote(note, index = 0) {
  const source = isPlainObject(note) ? note : {};
  const now = new Date().toISOString();

  return {
    id: source.id || createId(),
    title: source.title || 'Untitled note',
    body: source.body || '',
    category: source.category || 'General',
    color: COLOR_NAMES.includes(source.color) ? source.color : 'cyan',
    pinned: Boolean(source.pinned),
    favorite: Boolean(source.favorite),
    archived: Boolean(source.archived),
    deletedAt: source.deletedAt || null,
    order: Number.isFinite(source.order) ? source.order : Date.now() - index,
    createdAt: source.createdAt || now,
    updatedAt: source.updatedAt || source.createdAt || now
  };
}

function loadNotes() {
  try {
    const savedNotes = JSON.parse(localStorage.getItem(STORAGE_KEYS.notes));
    return Array.isArray(savedNotes) ? savedNotes.map(normalizeNote) : [];
  } catch (error) {
    return [];
  }
}

function saveNotesNow() {
  localStorage.setItem(STORAGE_KEYS.notes, JSON.stringify(appState.notes));
}

const scheduleSaveNotes = debounce(saveNotesNow, 220);

function saveNotes() {
  scheduleSaveNotes();
}

function saveDraft() {
  if (isResetting || dom.noteIdInput.value) return;

  const title = dom.titleInput.value.trim();
  const category = dom.categoryInput.value.trim();
  const body = dom.bodyInput.value.trim();

  if (!title && !body && !category) {
    localStorage.removeItem(STORAGE_KEYS.draft);
    return;
  }

  const draft = {
    title,
    category,
    body,
    color: getSelectedColor()
  };

  localStorage.setItem(STORAGE_KEYS.draft, JSON.stringify(draft));
}

function loadDraft() {
  try {
    const draftString = localStorage.getItem(STORAGE_KEYS.draft);
    if (!draftString) return;

    const draft = JSON.parse(draftString);
    if (!draft || (!draft.title && !draft.body && !draft.category)) return;

    dom.titleInput.value = draft.title || '';
    dom.categoryInput.value = draft.category || '';
    dom.bodyInput.value = draft.body || '';
    setSelectedColor(draft.color || 'cyan');
    dom.formMode.textContent = FORM_COPY.recoveredMode;
  } catch (error) {
    localStorage.removeItem(STORAGE_KEYS.draft);
  }
}

function clearDraft() {
  localStorage.removeItem(STORAGE_KEYS.draft);
}

function getPreferredTheme() {
  const savedTheme = localStorage.getItem(STORAGE_KEYS.theme);
  if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme) {
  document.body.classList.add('theme-morphing');
  const isDark = theme === 'dark';

  document.body.classList.toggle('dark', isDark);
  dom.themeIcon.textContent = isDark ? 'Light' : 'Dark';
  dom.themeToggle.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} mode`);
  localStorage.setItem(STORAGE_KEYS.theme, theme);

  window.setTimeout(() => document.body.classList.remove('theme-morphing'), appState.prefersReducedMotion ? 1 : 420);
}

function getSelectedColor() {
  const selected = dom.noteForm.querySelector('input[name="color"]:checked');
  return selected ? selected.value : 'cyan';
}

function setSelectedColor(color) {
  const selectedColor = COLOR_NAMES.includes(color) ? color : 'cyan';
  const input = dom.noteForm.querySelector(`input[name="color"][value="${selectedColor}"]`);
  if (input) input.checked = true;
}

/**
 * SECTION: UI RENDERING (COMPONENTS)
 */
function populateControlOptions() {
  dom.filterGroup.innerHTML = FILTER_OPTIONS.map((filter) => `
    <button
      class="filter-chip ripple-target"
      type="button"
      data-filter="${filter.value}">
      ${filter.label}
    </button>
  `).join('');

  dom.sortSelect.innerHTML = SORT_OPTIONS.map((option) => `
    <option value="${option.value}">${option.label}</option>
  `).join('');

  updateFilterControls();
  dom.sortSelect.value = appState.activeSort;
}

function getNoteBadges(note) {
  const badges = [escapeHtml(note.category || 'General')];
  if (note.pinned) badges.push('Pinned');
  if (note.favorite) badges.push('Favorite');
  if (note.archived) badges.push('Archived');
  if (note.deletedAt) badges.push('Trash');
  return badges;
}

function renderNoteCard(note, index) {
  const changedClass = note.id === appState.lastChangedId ? 'pulse' : '';
  const editingClass = note.id === dom.noteIdInput.value ? 'editing' : '';
  const selectedClass = appState.selectedIds.has(note.id) ? 'selected' : '';
  const badges = getNoteBadges(note)
    .map((badge) => `<span class="note-badge">${badge}</span>`)
    .join('');
  const canReorder = appState.activeSort === 'manual' && !note.deletedAt;

  return `
    <article
      class="note-card ${changedClass} ${editingClass} ${selectedClass} ${canReorder ? 'reorder-enabled' : ''}"
      draggable="${canReorder}"
      data-id="${note.id}"
      data-color="${note.color}"
      style="--stagger:${index * 30}ms">
      <div class="note-topline">
        <label class="select-note" data-tooltip="Select note">
          <input type="checkbox" data-action="select-note" ${appState.selectedIds.has(note.id) ? 'checked' : ''}>
          <span></span>
        </label>
        <div class="note-badges">${badges}</div>
      </div>
      <div>
        <h4>${escapeHtml(note.title)}</h4>
        <div class="note-body">${renderMarkdown(note.body)}</div>
      </div>
      <div class="note-meta">
        <span>Last edited ${formatDate(note.updatedAt)}</span>
        <span>${getWordCount(note.body)} words</span>
      </div>
      <div class="note-actions" aria-label="Note actions">
        ${note.deletedAt ? `
          <button class="note-action ripple-target" type="button" data-action="restore-trash" data-tooltip="Restore note">Restore</button>
          <button class="note-action danger ripple-target" type="button" data-action="delete" data-tooltip="Delete forever">Delete</button>
        ` : `
          <button class="note-action ripple-target" type="button" data-action="pin" data-tooltip="Pin note">${note.pinned ? 'Unpin' : 'Pin'}</button>
          <button class="note-action ripple-target" type="button" data-action="favorite" data-tooltip="Favorite note">${note.favorite ? 'Unstar' : 'Star'}</button>
          <button class="note-action ripple-target" type="button" data-action="edit" data-tooltip="Edit note">Edit</button>
          <button class="note-action ripple-target" type="button" data-action="copy" data-tooltip="Copy note">Copy</button>
          <button class="note-action ripple-target" type="button" data-action="duplicate" data-tooltip="Duplicate note">Duplicate</button>
          <button class="note-action ripple-target" type="button" data-action="archive" data-tooltip="Archive note">${note.archived ? 'Restore' : 'Archive'}</button>
          <button class="note-action danger ripple-target" type="button" data-action="delete" data-tooltip="Move to trash">Delete</button>
        `}
      </div>
    </article>
  `;
}

function animateNumber(element, from, to) {
  const start = performance.now();
  const duration = appState.prefersReducedMotion ? 1 : 320;

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = Math.round(from + (to - from) * eased);
    if (progress < 1) window.requestAnimationFrame(tick);
  }

  window.requestAnimationFrame(tick);
}

function updateStats() {
  const activeNotes = appState.notes.filter((note) => !note.archived && !note.deletedAt);
  const stats = {
    total: activeNotes.length,
    pinned: activeNotes.filter((note) => note.pinned).length,
    favorites: activeNotes.filter((note) => note.favorite).length,
    archived: appState.notes.filter((note) => note.archived && !note.deletedAt).length
  };

  Object.entries(stats).forEach(([key, value]) => {
    if (dom.statEls[key]) {
      animateNumber(dom.statEls[key], appState.lastStats[key], value);
    }
  });

  appState.lastStats = stats;
}

function updateFilterControls() {
  dom.filterGroup.querySelectorAll('[data-filter]').forEach((button) => {
    button.classList.toggle('active', button.dataset.filter === appState.activeFilter);
  });
}

function updateBulkToolbar() {
  dom.bulkToolbar.classList.toggle('hidden', appState.selectedIds.size === 0);
  dom.selectedCount.textContent = `${appState.selectedIds.size} selected`;
}

function getEmptyStateCopy() {
  return appState.currentSearch.trim()
    ? EMPTY_STATE_COPY.search
    : EMPTY_STATE_COPY[appState.activeFilter] || EMPTY_STATE_COPY.all;
}

function renderNotes(force = false) {
  const visibleNotes = getVisibleNotes();
  const pinnedNotes = appState.activeFilter === 'all'
    ? visibleNotes.filter((note) => note.pinned && !note.archived && !note.deletedAt)
    : [];
  const regularNotes = appState.activeFilter === 'all'
    ? visibleNotes.filter((note) => !note.pinned || note.archived || note.deletedAt)
    : visibleNotes;
  const signature = JSON.stringify({
    visible: visibleNotes.map((note) => [
      note.id, note.title, note.body, note.category, note.color, 
      note.pinned, note.favorite, note.archived, note.deletedAt, 
      note.updatedAt, note.order
    ]),
    activeFilter: appState.activeFilter,
    activeSort: appState.activeSort,
    currentSearch: appState.currentSearch,
    selected: [...appState.selectedIds],
    editing: dom.noteIdInput.value
  });

  updateStats();
  updateBulkToolbar();
  updateFilterControls();
  dom.sortSelect.value = appState.activeSort;

  if (!force && signature === appState.lastRenderSignature) return;
  appState.lastRenderSignature = signature;

  dom.notesContainer.classList.add('is-refreshing');
  dom.pinnedNotesContainer.classList.add('is-refreshing');

  dom.pinnedSection.classList.toggle('hidden', !pinnedNotes.length);
  dom.pinnedNotesContainer.innerHTML = pinnedNotes.map(renderNoteCard).join('');
  dom.notesContainer.innerHTML = regularNotes.map((note, index) => renderNoteCard(note, index + pinnedNotes.length)).join('');

  const hasVisibleNotes = visibleNotes.length > 0;
  const emptyCopy = getEmptyStateCopy();
  dom.emptyState.classList.toggle('hidden', hasVisibleNotes);
  dom.emptyState.innerHTML = `
    <span class="empty-illustration" aria-hidden="true"></span>
    <strong>${emptyCopy.title}</strong>
    <small>${emptyCopy.detail}</small>
  `;
  dom.notesCount.textContent = `${visibleNotes.length} ${visibleNotes.length === 1 ? 'note' : 'notes'} visible`;

  window.setTimeout(() => {
    dom.notesContainer.classList.remove('is-refreshing');
    dom.pinnedNotesContainer.classList.remove('is-refreshing');
    appState.lastChangedId = null;
  }, appState.prefersReducedMotion ? 1 : 240);
}

/**
 * SECTION: FILTERING & SORTING
 */
function matchesSearch(note) {
  const query = appState.currentSearch.trim().toLowerCase();
  if (!query) return true;
  return `${note.title} ${note.body} ${note.category}`.toLowerCase().includes(query);
}

function matchesFilter(note) {
  if (appState.activeFilter === 'trash') return Boolean(note.deletedAt);
  if (note.deletedAt) return false;
  if (appState.activeFilter === 'pinned') return note.pinned && !note.archived;
  if (appState.activeFilter === 'favorites') return note.favorite && !note.archived;
  if (appState.activeFilter === 'archived') return note.archived;
  if (appState.activeFilter === 'recent') {
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    return Date.now() - new Date(note.updatedAt).getTime() <= sevenDays && !note.archived;
  }
  return !note.archived;
}

function sortNotes(noteList) {
  return [...noteList].sort((a, b) => {
    if (appState.activeSort === 'oldest') return new Date(a.updatedAt) - new Date(b.updatedAt);
    if (appState.activeSort === 'az') return a.title.localeCompare(b.title);
    if (appState.activeSort === 'newest') return new Date(b.updatedAt) - new Date(a.updatedAt);
    return b.order - a.order;
  });
}

function getVisibleNotes() {
  return sortNotes(appState.notes.filter((note) => matchesFilter(note) && matchesSearch(note)));
}

/**
 * SECTION: FORM MANAGEMENT
 */
function setComposerMode(mode) {
  const isEditing = mode === 'edit';
  dom.composerTitle.textContent = isEditing ? FORM_COPY.editTitle : FORM_COPY.createTitle;
  dom.saveButton.textContent = isEditing ? 'Update note' : 'Add note';
  dom.cancelEditButton.classList.toggle('hidden', !isEditing);
  dom.formMode.textContent = isEditing ? FORM_COPY.editMode : FORM_COPY.createMode;
  dom.composer.classList.toggle('editing', isEditing);
}

function resetForm(options = {}) {
  const { clearSavedDraft = false } = options;
  isResetting = true;

  try {
    dom.noteForm.reset();
    
    // Forcefully clear values to guarantee they are empty
    dom.noteIdInput.value = '';
    dom.titleInput.value = '';
    dom.categoryInput.value = '';
    dom.bodyInput.value = '';
    
    setSelectedColor('cyan');
    setComposerMode('create');
    
    if (clearSavedDraft) {
      clearDraft();
    }
    
    dom.previewPanel.innerHTML = renderMarkdown(dom.bodyInput.value);
    renderNotes(true);
  } finally {
    isResetting = false;
  }
}

function beginEdit(note) {
  dom.noteIdInput.value = note.id;
  dom.titleInput.value = note.title;
  dom.categoryInput.value = note.category;
  dom.bodyInput.value = note.body;
  setSelectedColor(note.color);
  setComposerMode('edit');
  dom.previewPanel.innerHTML = renderMarkdown(dom.bodyInput.value);
  renderNotes(true);
  dom.titleInput.focus();
  dom.composer.scrollIntoView({ behavior: appState.prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
}

/**
 * SECTION: USER FEEDBACK (TOASTS)
 */
function showToast(title, message, options = {}) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <strong>${escapeHtml(title)}</strong>
    <span>${escapeHtml(message)}</span>
    ${options.action ? `<button type="button" data-action="${options.action}">${escapeHtml(options.actionLabel)}</button>` : ''}
  `;
  dom.toastStack.appendChild(toast);
  window.setTimeout(() => toast.remove(), options.duration || 3800);
}

/**
 * SECTION: NOTE OPERATIONS (CRUD)
 */
function handleFormSubmit(event) {
  event.preventDefault();

  const title = dom.titleInput.value.trim();
  const body = dom.bodyInput.value.trim();
  const category = dom.categoryInput.value.trim() || 'General';
  const color = getSelectedColor();
  const editingId = dom.noteIdInput.value;

  if (!title || !body) {
    showToast(TOAST_COPY.missingDetail.title, TOAST_COPY.missingDetail.message);
    return;
  }

  if (editingId) {
    appState.notes = appState.notes.map((note) => note.id === editingId
      ? { ...note, title, body, category, color, updatedAt: new Date().toISOString() }
      : note);
    appState.lastChangedId = editingId;
    showToast(TOAST_COPY.noteUpdated.title, TOAST_COPY.noteUpdated.message);
  } else {
    const note = normalizeNote({ title, body, category, color, order: Date.now() });
    appState.notes = [note, ...appState.notes];
    appState.lastChangedId = note.id;
    showToast(TOAST_COPY.noteAdded.title, TOAST_COPY.noteAdded.message);
  }

  saveNotes();
  resetForm({ clearSavedDraft: true });
}

function updateNote(noteId, updater, toastTitle, toastMessage) {
  appState.notes = appState.notes.map((note) => {
    if (note.id !== noteId) return note;
    return { ...updater(note), updatedAt: new Date().toISOString() };
  });
  appState.lastChangedId = noteId;
  saveNotes();
  renderNotes(true);
  showToast(toastTitle, toastMessage);
}

function duplicateNote(note) {
  const now = new Date().toISOString();
  const copy = {
    ...note,
    id: createId(),
    title: `${note.title} copy`,
    pinned: false,
    archived: false,
    deletedAt: null,
    order: Date.now(),
    createdAt: now,
    updatedAt: now
  };
  appState.notes = [copy, ...appState.notes];
  appState.lastChangedId = copy.id;
  saveNotes();
  renderNotes(true);
  showToast(TOAST_COPY.noteDuplicated.title, TOAST_COPY.noteDuplicated.message);
}

function requestDelete(noteId) {
  const note = appState.notes.find((item) => item.id === noteId);
  const copy = note && note.deletedAt ? MODAL_COPY.permanent : MODAL_COPY.trash;
  dom.deleteTitle.textContent = copy.title;
  dom.deleteText.textContent = copy.message;
  appState.pendingDeleteId = noteId;
  dom.deleteModal.classList.remove('hidden');
}

function closeModal() {
  appState.pendingDeleteId = null;
  dom.deleteModal.classList.add('hidden');
  dom.readModal.classList.add('hidden');
  document.body.classList.remove('modal-open');
}

function confirmDelete() {
  const note = appState.notes.find((item) => item.id === appState.pendingDeleteId);
  if (!note) {
    closeModal();
    return;
  }

  const card = document.querySelector(`[data-id="${appState.pendingDeleteId}"]`);
  if (card) card.classList.add('deleting');

  window.setTimeout(() => {
    appState.lastDeletedNote = note;
    if (note.deletedAt) {
      appState.notes = appState.notes.filter((item) => item.id !== appState.pendingDeleteId);
      showToast(TOAST_COPY.noteDeletedForever.title, TOAST_COPY.noteDeletedForever.message);
    } else {
      appState.notes = appState.notes.map((item) => item.id === appState.pendingDeleteId
        ? { ...item, deletedAt: new Date().toISOString(), pinned: false, archived: false }
        : item);
      showToast(TOAST_COPY.movedToTrash.title, TOAST_COPY.movedToTrash.message, {
        action: 'undo-delete',
        actionLabel: 'Undo',
        duration: 5200
      });
    }
    appState.selectedIds.delete(appState.pendingDeleteId);
    if (dom.noteIdInput.value === appState.pendingDeleteId) resetForm({ clearSavedDraft: true });
    saveNotes();
    renderNotes(true);
    closeModal();
  }, appState.prefersReducedMotion ? 1 : 150);
}

function undoDelete() {
  if (!appState.lastDeletedNote) return;
  appState.notes = appState.notes.map((note) => note.id === appState.lastDeletedNote.id
    ? { ...appState.lastDeletedNote, deletedAt: null }
    : note);
  appState.lastChangedId = appState.lastDeletedNote.id;
  saveNotes();
  renderNotes(true);
  showToast(TOAST_COPY.deleteUndone.title, TOAST_COPY.deleteUndone.message);
  appState.lastDeletedNote = null;
}

async function copyNote(note) {
  const text = `${note.title}\n\n${note.body}`;
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
  }
  showToast(TOAST_COPY.copied.title, TOAST_COPY.copied.message);
}

function openReadModal(note) {
  if (dom.readModal.dataset.editing) delete dom.readModal.dataset.editing;
  dom.readTitle.textContent = note.title;
  dom.readBody.innerHTML = renderMarkdown(note.body);
  dom.readBadges.innerHTML = getNoteBadges(note)
    .map((badge) => `<span class="note-badge">${badge}</span>`)
    .join('');
  dom.readMeta.textContent = `Last edited ${formatDate(note.updatedAt)}`;
  dom.readModal.dataset.id = note.id;
  
  const footer = dom.readModal.querySelector('.form-actions');
  if (footer) {
    footer.innerHTML = `
      <button class="button button-ghost ripple-target" type="button" data-action="delete-from-modal">Delete</button>
      <button class="button button-primary ripple-target" type="button" data-action="edit-from-modal">Edit Note</button>
      <button class="button button-ghost ripple-target" type="button" data-action="close-modal">Close</button>
    `;
  }
  
  document.body.classList.add('modal-open');
  dom.readModal.classList.remove('hidden');
}

function beginModalEdit(note) {
  dom.readModal.dataset.editing = 'true';
  dom.readTitle.innerHTML = `<input id="modal-title" class="modal-input" value="${escapeHtml(note.title)}">`;
  dom.readBody.innerHTML = `<textarea id="modal-body" class="modal-textarea">${escapeHtml(note.body)}</textarea>`;
  dom.readMeta.textContent = `Editing note`;

  const footer = dom.readModal.querySelector('.form-actions');
  footer.innerHTML = `
    <button class="button button-ghost ripple-target" type="button" data-action="delete-from-modal">Delete</button>
    <button class="button button-ghost ripple-target" type="button" data-action="save-from-modal">Save</button>
    <button class="button button-ghost button-accent ripple-target" type="button" data-action="cancel-modal-edit">Cancel</button>
  `;

  const titleEl = document.getElementById('modal-title');
  if (titleEl) titleEl.focus();
}

function saveFromModal() {
  const id = dom.readModal.dataset.id;
  const titleEl = document.getElementById('modal-title');
  const bodyEl = document.getElementById('modal-body');
  if (!id || !titleEl || !bodyEl) return;

  const title = titleEl.value.trim();
  const body = bodyEl.value.trim();
  if (!title || !body) {
    showToast(TOAST_COPY.missingDetail.title, TOAST_COPY.missingDetail.message);
    return;
  }

  appState.notes = appState.notes.map((note) => note.id === id ? { ...note, title, body, updatedAt: new Date().toISOString() } : note);
  saveNotes();
  const updated = appState.notes.find((n) => n.id === id);
  renderNotes(true);
  openReadModal(updated);
  showToast(TOAST_COPY.noteUpdated.title, TOAST_COPY.noteUpdated.message);
}

function cancelModalEdit() {
  const id = dom.readModal.dataset.id;
  if (!id) return;
  const note = appState.notes.find((n) => n.id === id);
  if (note) openReadModal(note);
}

/**
 * SECTION: DATA EXPORT/IMPORT
 */
function exportNotes() {
  const payload = JSON.stringify({ exportedAt: new Date().toISOString(), notes: appState.notes }, null, 2);
  const blob = new Blob([payload], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'smart-notes-export.json';
  link.click();
  URL.revokeObjectURL(url);
  showToast(TOAST_COPY.exportReady.title, TOAST_COPY.exportReady.message);
}

async function importNotes(file) {
  try {
    const parsed = JSON.parse(await file.text());
    const importedEntries = Array.isArray(parsed) ? parsed : (parsed.notes || []);
    const existingIds = new Set(appState.notes.map((note) => note.id));
    const seenImportIds = new Set();
    const importedNotes = [];
    let skippedCount = 0;

    importedEntries.forEach((entry, index) => {
      if (!isPlainObject(entry)) {
        skippedCount += 1;
        return;
      }
      const normalized = normalizeNote(entry, index);
      if (existingIds.has(normalized.id) || seenImportIds.has(normalized.id)) {
        skippedCount += 1;
        return;
      }
      seenImportIds.add(normalized.id);
      importedNotes.push(normalized);
    });

    if (importedNotes.length) {
      appState.notes = [...importedNotes, ...appState.notes];
      saveNotesNow();
      renderNotes(true);
    }
    const summary = TOAST_COPY.importSummary(importedNotes.length, skippedCount);
    showToast(summary.title, summary.message);
  } catch (error) {
    showToast(TOAST_COPY.importFailed.title, TOAST_COPY.importFailed.message);
  }
}

/**
 * SECTION: BULK ACTIONS & REORDERING
 */
function bulkUpdate(updater, title, message) {
  appState.notes = appState.notes.map((note) => appState.selectedIds.has(note.id) ? updater(note) : note);
  appState.selectedIds.clear();
  saveNotes();
  renderNotes(true);
  showToast(title, message);
}

function reorderVisibleNotes(targetId) {
  if (appState.activeSort !== 'manual') {
    showToast(TOAST_COPY.orderManualOnly.title, TOAST_COPY.orderManualOnly.message);
    return;
  }
  if (!appState.draggedId || appState.draggedId === targetId) return;

  const cards = [...document.querySelectorAll('.note-card')];
  const visibleIds = cards.map((card) => card.dataset.id);
  const fromIndex = visibleIds.indexOf(appState.draggedId);
  const toIndex = visibleIds.indexOf(targetId);

  if (fromIndex < 0 || toIndex < 0) return;

  visibleIds.splice(toIndex, 0, visibleIds.splice(fromIndex, 1)[0]);
  appState.notes = appState.notes.map((note) => {
    const index = visibleIds.indexOf(note.id);
    return index >= 0 ? { ...note, order: visibleIds.length - index } : note;
  });

  saveNotes();
  renderNotes(true);
  showToast(TOAST_COPY.orderUpdated.title, TOAST_COPY.orderUpdated.message);
}

/**
 * SECTION: EVENT DELEGATION
 */
function handleDelegatedAction(event) {
  const actionButton = event.target.closest('[data-action]');
  const clickableCard = event.target.closest('.note-card');

  if (clickableCard && !actionButton && !event.target.closest('.select-note')) {
    const cardNote = appState.notes.find((item) => item.id === clickableCard.dataset.id);
    if (cardNote) openReadModal(cardNote);
    return;
  }

  if (!actionButton) return;

  const action = actionButton.dataset.action;
  const card = actionButton.closest('[data-id]');
  const noteId = card ? card.dataset.id : null;
  const note = noteId ? appState.notes.find((item) => item.id === noteId) : null;

  const handlers = {
    theme() {
      const nextTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
      applyTheme(nextTheme);
      const toast = TOAST_COPY.themeUpdated(nextTheme);
      showToast(toast.title, toast.message);
    },
    'clear-all-notes'() {
      if (confirm('Are you sure you want to delete ALL notes? This action cannot be undone and will wipe your entire notebook memory.')) {
        appState.notes = [];
        saveNotesNow();
        resetForm({ clearSavedDraft: true });
        renderNotes(true);
        showToast('Memory wiped', 'All notes and drafts have been removed.');
      }
    },
    'clear-composer'() {
      resetForm({ clearSavedDraft: true });
      // Final insurance that storage is empty
      localStorage.removeItem(STORAGE_KEYS.draft);
      showToast(TOAST_COPY.composerCleared.title, TOAST_COPY.composerCleared.message);
    },
    'jump-to-notes'() {
      document.getElementById('notes-panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    'toggle-filters'() {
      dom.controlsSection.classList.toggle('filters-open');
    },
    'export-json'() {
      exportNotes();
    },
    'import-json'() {
      dom.importFile.click();
    },
    'cancel-edit'() {
      resetForm();
      showToast(TOAST_COPY.editCancelled.title, TOAST_COPY.editCancelled.message);
    },
    'focus-composer'() {
      dom.composer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      dom.titleInput.focus();
    },
    'close-modal'() {
      closeModal();
    },
    'confirm-delete'() {
      confirmDelete();
    },
    'undo-delete'() {
      undoDelete();
      actionButton.closest('.toast')?.remove();
    },
    'clear-selection'() {
      appState.selectedIds.clear();
      renderNotes(true);
    },
    'bulk-favorite'() {
      bulkUpdate((item) => ({ ...item, favorite: true, updatedAt: new Date().toISOString() }), 'Favorites updated', 'Selected notes were starred.');
    },
    'bulk-archive'() {
      bulkUpdate((item) => ({ ...item, archived: true, pinned: false, updatedAt: new Date().toISOString() }), 'Notes archived', 'Selected notes moved to archive.');
    },
    'bulk-delete'() {
      bulkUpdate((item) => ({ ...item, deletedAt: new Date().toISOString(), pinned: false, archived: false }), 'Moved to trash', 'Selected notes moved to trash.');
    },
    'edit-from-modal'() {
      const modalNote = appState.notes.find((item) => item.id === dom.readModal.dataset.id);
      if (modalNote) beginModalEdit(modalNote);
    },
    'save-from-modal'() {
      saveFromModal();
    },
    'cancel-modal-edit'() {
      cancelModalEdit();
    },
    'delete-from-modal'() {
      const modalId = dom.readModal.dataset.id;
      if (modalId) {
        requestDelete(modalId);
        dom.readModal.classList.add('hidden');
      }
    },
    'select-note'() {
      actionButton.checked ? appState.selectedIds.add(noteId) : appState.selectedIds.delete(noteId);
      renderNotes(true);
    },
    pin() {
      updateNote(noteId, (item) => ({ ...item, pinned: !item.pinned }), note.pinned ? 'Note unpinned' : 'Note pinned', 'Pinned notes stay in their own section.');
    },
    favorite() {
      updateNote(noteId, (item) => ({ ...item, favorite: !item.favorite }), note.favorite ? 'Favorite removed' : 'Favorite added', 'Use the Favorites filter to find it fast.');
    },
    edit() { beginEdit(note); },
    copy() { copyNote(note); },
    duplicate() { duplicateNote(note); },
    archive() {
      updateNote(noteId, (item) => ({ ...item, archived: !item.archived, pinned: item.archived ? item.pinned : false }), note.archived ? 'Note restored' : 'Note archived', note.archived ? 'It is back in active notes.' : 'Find it with the Archived filter.');
    },
    'restore-trash'() {
      updateNote(noteId, (item) => ({ ...item, deletedAt: null }), 'Note restored', 'It is back in your notebook.');
    },
    delete() { requestDelete(noteId); }
  };

  if (handlers[action]) handlers[action]();
}

/**
 * SECTION: GLOBAL EVENT LISTENERS
 */
function handleKeyboard(event) {
  if (event.key === 'Escape') {
    if (!dom.readModal.classList.contains('hidden') || !dom.deleteModal.classList.contains('hidden')) {
      closeModal();
      return;
    }
    if (dom.noteIdInput.value) {
      resetForm();
      showToast(TOAST_COPY.editCancelled.title, TOAST_COPY.editCancelled.message);
    }
  }
  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
    event.preventDefault();
    dom.noteForm.requestSubmit();
  }
}

function addRipple(event) {
  const target = event.target.closest('.ripple-target');
  if (!target) return;
  const rect = target.getBoundingClientRect();
  const ripple = document.createElement('span');
  const size = Math.max(rect.width, rect.height);
  ripple.className = 'ripple';
  ripple.style.width = `${size}px`;
  ripple.style.height = `${size}px`;
  ripple.style.left = `${event.clientX - rect.left}px`;
  ripple.style.top = `${event.clientY - rect.top}px`;
  target.appendChild(ripple);
  window.setTimeout(() => ripple.remove(), 650);
}

function handleCardTilt(event) {
  const card = event.target.closest('.note-card');
  if (!card) return;
  const rect = card.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width - 0.5) * 6;
  const y = ((event.clientY - rect.top) / rect.height - 0.5) * -6;
  card.style.setProperty('--tilt-x', `${y}deg`);
  card.style.setProperty('--tilt-y', `${x}deg`);
}

function resetCardTilt(event) {
  const card = event.target.closest('.note-card');
  if (!card) return;
  card.style.setProperty('--tilt-x', '0deg');
  card.style.setProperty('--tilt-y', '0deg');
}

/**
 * SECTION: INITIALIZATION
 */
document.addEventListener('click', addRipple);
document.addEventListener('click', handleDelegatedAction);
document.addEventListener('keydown', handleKeyboard);
document.addEventListener('pointermove', (event) => {
  dom.cursorGlow.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`;
  handleCardTilt(event);
});
document.addEventListener('pointerout', resetCardTilt);

document.addEventListener('dragstart', (event) => {
  const card = event.target.closest('.note-card');
  if (!card) return;
  appState.draggedId = card.dataset.id;
  card.classList.add('dragging');
});

document.addEventListener('dragover', (event) => {
  if (event.target.closest('.note-card')) event.preventDefault();
});

document.addEventListener('drop', (event) => {
  const targetCard = event.target.closest('.note-card');
  if (!targetCard) return;
  event.preventDefault();
  reorderVisibleNotes(targetCard.dataset.id);
});

document.addEventListener('dragend', () => {
  appState.draggedId = null;
  document.querySelectorAll('.dragging').forEach((card) => card.classList.remove('dragging'));
});

dom.noteForm.addEventListener('submit', handleFormSubmit);
dom.noteForm.addEventListener('input', () => {
  dom.previewPanel.innerHTML = renderMarkdown(dom.bodyInput.value);
  saveDraft();
});

const debouncedSearch = debounce((value) => {
  appState.currentSearch = value;
  renderNotes(true);
}, 180);

dom.searchInput.addEventListener('input', (event) => debouncedSearch(event.target.value));

dom.sortSelect.addEventListener('change', (event) => {
  appState.activeSort = event.target.value;
  renderNotes(true);
});

dom.filterGroup.addEventListener('click', (event) => {
  const filterButton = event.target.closest('[data-filter]');
  if (!filterButton) return;
  appState.activeFilter = filterButton.dataset.filter;
  appState.selectedIds.clear();
  renderNotes(true);
});

dom.deleteModal.addEventListener('click', (event) => {
  if (event.target === dom.deleteModal) closeModal();
});

dom.readModal.addEventListener('click', (event) => {
  if (event.target === dom.readModal) closeModal();
});

dom.importFile.addEventListener('change', (event) => {
  const [file] = event.target.files;
  if (file) importNotes(file);
  dom.importFile.value = '';
});

window.addEventListener('load', () => {
  window.setTimeout(() => dom.loader.classList.add('loaded'), 520);
});

// Start the app
appState.notes = loadNotes();
populateControlOptions();
applyTheme(getPreferredTheme());
loadDraft();
dom.previewPanel.innerHTML = renderMarkdown(dom.bodyInput.value);
renderNotes(true);
