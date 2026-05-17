/**
 * SECTION: CONFIGURATION & DOM SELECTORS
 * We start by defining our storage keys and selecting all the DOM elements 
 * we'll need to interact with.
 */
const NOTES_KEY = 'smart-notes-app-notes';
const THEME_KEY = 'smart-notes-app-theme';
const DRAFT_KEY = 'smart-notes-app-draft';

const appShell = document.getElementById('app-shell');
const loader = document.getElementById('startup-loader');
const noteForm = document.getElementById('note-form');
const noteIdInput = document.getElementById('note-id');
const titleInput = document.getElementById('note-title');
const categoryInput = document.getElementById('note-category');
const bodyInput = document.getElementById('note-body');
const saveButton = document.getElementById('save-note');
const cancelEditButton = document.getElementById('cancel-edit');
const formMode = document.getElementById('form-mode');
const previewPanel = document.getElementById('markdown-preview');
const searchInput = document.getElementById('search-notes');
const sortSelect = document.getElementById('sort-notes');
const filterGroup = document.getElementById('filter-group');
const pinnedSection = document.getElementById('pinned-section');
const pinnedNotesContainer = document.getElementById('pinned-notes');
const notesContainer = document.getElementById('notes-container');
const emptyState = document.getElementById('empty-state');
const notesCount = document.getElementById('notes-count');
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = themeToggle.querySelector('.theme-icon');
const toastStack = document.getElementById('toast-stack');
const deleteModal = document.getElementById('delete-modal');
const deleteTitle = document.getElementById('delete-title');
const deleteText = document.getElementById('delete-text');
const importFile = document.getElementById('import-file');
const bulkToolbar = document.getElementById('bulk-toolbar');
const selectedCount = document.getElementById('selected-count');
const cursorGlow = document.getElementById('cursor-glow');

const statEls = {
  total: document.getElementById('total-stat'),
  pinned: document.getElementById('pinned-stat'),
  favorites: document.getElementById('favorite-stat'),
  archived: document.getElementById('archived-stat')
};

const colorNames = ['cyan', 'violet', 'amber', 'rose', 'emerald'];
const selectedIds = new Set();

/**
 * SECTION: APPLICATION STATE
 * These variables track the current state of the application, 
 * like the list of notes, active filters, and UI session data.
 */
let notes = loadNotes();
let activeFilter = 'all';
let activeSort = 'manual';
let currentSearch = '';
let pendingDeleteId = null;
let lastDeletedNote = null;
let lastChangedId = null;
let draggedId = null;
let lastRenderSignature = '';
let lastStats = { total: 0, pinned: 0, favorites: 0, archived: 0 };

/**
 * SECTION: UTILITY FUNCTIONS
 * Generic helper functions for generating IDs, debouncing actions, 
 * and formatting data.
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

/**
 * SECTION: STORAGE & DATA PERSISTENCE
 * Functions that handle reading from and writing to LocalStorage.
 */
function normalizeNote(note, index = 0) {
  const now = new Date().toISOString();

  return {
    id: note.id || createId(),
    title: note.title || 'Untitled note',
    body: note.body || '',
    category: note.category || 'General',
    color: colorNames.includes(note.color) ? note.color : 'cyan',
    pinned: Boolean(note.pinned),
    favorite: Boolean(note.favorite),
    archived: Boolean(note.archived),
    deletedAt: note.deletedAt || null,
    order: Number.isFinite(note.order) ? note.order : Date.now() - index,
    createdAt: note.createdAt || now,
    updatedAt: note.updatedAt || note.createdAt || now
  };
}

function loadNotes() {
  try {
    const savedNotes = JSON.parse(localStorage.getItem(NOTES_KEY));
    return Array.isArray(savedNotes) ? savedNotes.map(normalizeNote) : [];
  } catch (error) {
    return [];
  }
}

function saveNotesNow() {
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

const scheduleSaveNotes = debounce(saveNotesNow, 220);

function saveNotes() {
  scheduleSaveNotes();
}

function saveDraft() {
  if (noteIdInput.value) return;

  const title = titleInput.value.trim();
  const category = categoryInput.value.trim();
  const body = bodyInput.value.trim();

  // If the form is empty, ensure the draft is removed from storage
  if (!title && !body && !category) {
    localStorage.removeItem(DRAFT_KEY);
    return;
  }

  const draft = {
    title,
    category,
    body,
    color: getSelectedColor()
  };

  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

function loadDraft() {
  try {
    const draft = JSON.parse(localStorage.getItem(DRAFT_KEY));
    if (!draft || (!draft.title && !draft.body && !draft.category)) return;

    titleInput.value = draft.title || '';
    categoryInput.value = draft.category || '';
    bodyInput.value = draft.body || '';
    setSelectedColor(draft.color || 'cyan');
    formMode.textContent = 'Draft recovered from your last session.';
  } catch (error) {
    localStorage.removeItem(DRAFT_KEY);
  }
}

function clearDraft() {
  localStorage.removeItem(DRAFT_KEY);
}

/**
 * SECTION: THEME MANAGEMENT
 * Logic for handling light/dark modes and user preferences.
 */
function getPreferredTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme) {
  document.body.classList.add('theme-morphing');
  const isDark = theme === 'dark';

  document.body.classList.toggle('dark', isDark);
  themeIcon.textContent = isDark ? 'Light' : 'Dark';
  themeToggle.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} mode`);
  localStorage.setItem(THEME_KEY, theme);

  window.setTimeout(() => document.body.classList.remove('theme-morphing'), 420);
}

function getSelectedColor() {
  const selected = noteForm.querySelector('input[name="color"]:checked');
  return selected ? selected.value : 'cyan';
}

function setSelectedColor(color) {
  const selectedColor = colorNames.includes(color) ? color : 'cyan';
  const input = noteForm.querySelector(`input[name="color"][value="${selectedColor}"]`);
  if (input) input.checked = true;
}

/**
 * SECTION: NOTE OPERATIONS
 * Core logic for creating, updating, and formatting note data.
 */
function createNote(title, body, category, color) {
  const now = new Date().toISOString();

  return {
    id: createId(),
    title,
    body,
    category: category || 'General',
    color,
    pinned: false,
    favorite: false,
    archived: false,
    deletedAt: null,
    order: Date.now(),
    createdAt: now,
    updatedAt: now
  };
}

function getWordCount(text) {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

function updateCounters() {
  const words = getWordCount(bodyInput.value);
  document.getElementById('word-count').textContent = `${words} ${words === 1 ? 'word' : 'words'}`;
  document.getElementById('char-count').textContent = `${bodyInput.value.length} / ${bodyInput.maxLength} chars`;
  previewPanel.innerHTML = renderMarkdown(bodyInput.value);
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

/**
 * SECTION: MARKDOWN RENDERING
 * A simple regex-based parser to convert markdown syntax to HTML.
 */
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
 * SECTION: FILTERING & SORTING
 * Logic to decide which notes to show based on the current UI settings.
 */
function matchesSearch(note) {
  const query = currentSearch.trim().toLowerCase();
  if (!query) return true;

  return `${note.title} ${note.body} ${note.category}`.toLowerCase().includes(query);
}

function matchesFilter(note) {
  if (activeFilter === 'trash') return Boolean(note.deletedAt);
  if (note.deletedAt) return false;
  if (activeFilter === 'pinned') return note.pinned && !note.archived;
  if (activeFilter === 'favorites') return note.favorite && !note.archived;
  if (activeFilter === 'archived') return note.archived;
  if (activeFilter === 'recent') {
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    return Date.now() - new Date(note.updatedAt).getTime() <= sevenDays && !note.archived;
  }

  return !note.archived;
}

function sortNotes(noteList) {
  return [...noteList].sort((a, b) => {
    if (activeSort === 'oldest') return new Date(a.updatedAt) - new Date(b.updatedAt);
    if (activeSort === 'az') return a.title.localeCompare(b.title);
    if (activeSort === 'newest') return new Date(b.updatedAt) - new Date(a.updatedAt);
    return b.order - a.order;
  });
}

function getVisibleNotes() {
  return sortNotes(notes.filter((note) => matchesFilter(note) && matchesSearch(note)));
}

/**
 * SECTION: UI RENDERING (COMPONENTS)
 * Functions that build the HTML structure for notes and update the DOM.
 */
function getNoteBadges(note) {
  const badges = [escapeHtml(note.category || 'General')];
  if (note.pinned) badges.push('Pinned');
  if (note.favorite) badges.push('Favorite');
  if (note.archived) badges.push('Archived');
  if (note.deletedAt) badges.push('Trash');
  return badges;
}

function renderNoteCard(note, index) {
  const changedClass = note.id === lastChangedId ? 'pulse' : '';
  const editingClass = note.id === noteIdInput.value ? 'editing' : '';
  const selectedClass = selectedIds.has(note.id) ? 'selected' : '';
  const badges = getNoteBadges(note)
    .map((badge) => `<span class="note-badge">${badge}</span>`)
    .join('');

  return `
    <article class="note-card ${changedClass} ${editingClass} ${selectedClass}" draggable="true" data-id="${note.id}" data-color="${note.color}" style="--stagger:${index * 42}ms">
      <div class="note-topline">
        <label class="select-note" data-tooltip="Select note">
          <input type="checkbox" data-action="select-note" ${selectedIds.has(note.id) ? 'checked' : ''}>
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
  const duration = 420;

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = Math.round(from + (to - from) * eased);
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

function updateStats() {
  const activeNotes = notes.filter((note) => !note.archived && !note.deletedAt);
  const stats = {
    total: activeNotes.length,
    pinned: activeNotes.filter((note) => note.pinned).length,
    favorites: activeNotes.filter((note) => note.favorite).length,
    archived: notes.filter((note) => note.archived && !note.deletedAt).length
  };

  Object.keys(stats).forEach((key) => {
    if (stats[key] !== lastStats[key]) animateNumber(statEls[key], lastStats[key], stats[key]);
  });

  lastStats = stats;
  notesCount.textContent = `${activeNotes.length} active ${activeNotes.length === 1 ? 'note' : 'notes'} saved`;
}

/**
 * SECTION: MAIN RENDER LOOP
 * The heart of the rendering system. It builds the UI from state 
 * and optimizes by skipping DOM writes if nothing changed.
 */
function renderNotes(force = false) {
  const visibleNotes = getVisibleNotes();
  const pinnedNotes = activeFilter === 'all'
    ? visibleNotes.filter((note) => note.pinned && !note.archived && !note.deletedAt)
    : [];
  const regularNotes = activeFilter === 'all'
    ? visibleNotes.filter((note) => !note.pinned || note.archived || note.deletedAt)
    : visibleNotes;
  const signature = JSON.stringify({
    visible: visibleNotes.map((note) => [note.id, note.title, note.body, note.category, note.color, note.pinned, note.favorite, note.archived, note.deletedAt, note.updatedAt, note.order]),
    activeFilter,
    activeSort,
    currentSearch,
    selected: [...selectedIds],
    editing: noteIdInput.value
  });

  updateStats();
  updateBulkToolbar();

  if (!force && signature === lastRenderSignature) return;
  lastRenderSignature = signature;

  notesContainer.classList.add('is-refreshing');
  pinnedNotesContainer.classList.add('is-refreshing');

  pinnedSection.classList.toggle('hidden', !pinnedNotes.length);
  pinnedNotesContainer.innerHTML = pinnedNotes.map(renderNoteCard).join('');
  notesContainer.innerHTML = regularNotes.map((note, index) => renderNoteCard(note, index + pinnedNotes.length)).join('');

  const hasVisibleNotes = visibleNotes.length > 0;
  emptyState.classList.toggle('hidden', hasVisibleNotes);
  emptyState.innerHTML = getEmptyMessage();

  window.setTimeout(() => {
    notesContainer.classList.remove('is-refreshing');
    pinnedNotesContainer.classList.remove('is-refreshing');
    lastChangedId = null;
  }, 360);
}

function getEmptyMessage() {
  const message = currentSearch.trim()
    ? 'No notes match your search.'
    : {
        archived: 'No archived notes yet.',
        favorites: 'No favorite notes yet.',
        pinned: 'No pinned notes yet.',
        recent: 'No notes edited in the last 7 days.',
        trash: 'Trash is empty.'
      }[activeFilter] || 'No notes yet. Add your first note above.';

  return `<span class="empty-illustration" aria-hidden="true"></span><strong>${message}</strong><small>Your ideas will appear here as cards.</small>`;
}

function updateBulkToolbar() {
  bulkToolbar.classList.toggle('hidden', selectedIds.size === 0);
  selectedCount.textContent = `${selectedIds.size} selected`;
}

/**
 * SECTION: FORM MANAGEMENT
 * Handles opening, resetting, and submitting the note form.
 */
function resetForm() {
  noteForm.reset();
  noteIdInput.value = '';
  setSelectedColor('cyan');
  saveButton.textContent = 'Add note';
  cancelEditButton.classList.add('hidden');
  formMode.textContent = 'Drafts auto-save while you type.';
  document.getElementById('composer').classList.remove('editing');
  updateCounters();
  renderNotes(true);
}

function beginEdit(note) {
  noteIdInput.value = note.id;
  titleInput.value = note.title;
  categoryInput.value = note.category;
  bodyInput.value = note.body;
  setSelectedColor(note.color);
  saveButton.textContent = 'Update note';
  cancelEditButton.classList.remove('hidden');
  formMode.textContent = 'Editing an existing note.';
  document.getElementById('composer').classList.add('editing');
  updateCounters();
  renderNotes(true);
  titleInput.focus();
  appShell.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * SECTION: USER FEEDBACK (TOASTS)
 * Logic for showing temporary notification messages.
 */
function showToast(title, message, options = {}) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <strong>${escapeHtml(title)}</strong>
    <span>${escapeHtml(message)}</span>
    ${options.action ? `<button type="button" data-action="${options.action}">${escapeHtml(options.actionLabel)}</button>` : ''}
  `;

  toastStack.appendChild(toast);
  window.setTimeout(() => toast.remove(), options.duration || 3800);
}

/**
 * SECTION: EVENT HANDLERS (CRUD)
 * Specific handlers for creating, updating, and deleting notes.
 */
function handleFormSubmit(event) {
  event.preventDefault();

  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();
  const category = categoryInput.value.trim() || 'General';
  const color = getSelectedColor();
  const editingId = noteIdInput.value;

  if (!title || !body) {
    showToast('Missing detail', 'Add a title and note body before saving.');
    return;
  }

  if (editingId) {
    notes = notes.map((note) => note.id === editingId
      ? { ...note, title, body, category, color, updatedAt: new Date().toISOString() }
      : note);
    lastChangedId = editingId;
    showToast('Note updated', 'Your changes were saved.');
  } else {
    const note = createNote(title, body, category, color);
    notes = [note, ...notes];
    lastChangedId = note.id;
    clearDraft();
    showToast('Note added', 'Your note is now in the workspace.');
  }

  saveNotes();
  resetForm();
  renderNotes(true);
}

function updateNote(noteId, updater, toastTitle, toastMessage) {
  notes = notes.map((note) => {
    if (note.id !== noteId) return note;
    return { ...updater(note), updatedAt: new Date().toISOString() };
  });
  lastChangedId = noteId;
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

  notes = [copy, ...notes];
  lastChangedId = copy.id;
  saveNotes();
  renderNotes(true);
  showToast('Note duplicated', 'A fresh copy was added.');
}

function requestDelete(noteId) {
  const note = notes.find((item) => item.id === noteId);
  const isPermanent = Boolean(note && note.deletedAt);

  deleteTitle.textContent = isPermanent ? 'Delete forever?' : 'Move this note to trash?';
  deleteText.textContent = isPermanent
    ? 'This permanently removes the note from LocalStorage.'
    : 'This moves the note out of your workspace. You can restore it from Trash.';
  pendingDeleteId = noteId;
  deleteModal.classList.remove('hidden');
}

function closeModal() {
  pendingDeleteId = null;
  deleteModal.classList.add('hidden');
}

function confirmDelete() {
  const note = notes.find((item) => item.id === pendingDeleteId);
  if (!note) {
    closeModal();
    return;
  }

  const card = document.querySelector(`[data-id="${pendingDeleteId}"]`);
  if (card) card.classList.add('deleting');

  window.setTimeout(() => {
    lastDeletedNote = note;

    if (note.deletedAt) {
      notes = notes.filter((item) => item.id !== pendingDeleteId);
      showToast('Note deleted forever', 'It was removed from storage.');
    } else {
      notes = notes.map((item) => item.id === pendingDeleteId
        ? { ...item, deletedAt: new Date().toISOString(), pinned: false, archived: false }
        : item);
      showToast('Moved to trash', 'You can restore it from the Trash filter.', {
        action: 'undo-delete',
        actionLabel: 'Undo',
        duration: 5200
      });
    }

    selectedIds.delete(pendingDeleteId);
    if (noteIdInput.value === pendingDeleteId) resetForm();
    pendingDeleteId = null;
    saveNotes();
    renderNotes(true);
    closeModal();
  }, 170);
}

function undoDelete() {
  if (!lastDeletedNote) return;

  notes = notes.map((note) => note.id === lastDeletedNote.id
    ? { ...lastDeletedNote, deletedAt: null }
    : note);
  lastChangedId = lastDeletedNote.id;
  saveNotes();
  renderNotes(true);
  showToast('Delete undone', 'Your note is back.');
  lastDeletedNote = null;
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

  showToast('Copied', 'Note text copied to clipboard.');
}

/**
 * SECTION: DATA EXPORT/IMPORT
 * Functions to handle JSON backup and restoration of notes.
 */
function exportNotes() {
  const payload = JSON.stringify({ exportedAt: new Date().toISOString(), notes }, null, 2);
  const blob = new Blob([payload], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = 'smart-notes-export.json';
  link.click();
  URL.revokeObjectURL(url);
  showToast('Export ready', 'Your notes were downloaded as JSON.');
}

function importNotes(file) {
  const reader = new FileReader();

  reader.addEventListener('load', () => {
    try {
      const parsed = JSON.parse(reader.result);
      const importedNotes = Array.isArray(parsed) ? parsed : parsed.notes;
      if (!Array.isArray(importedNotes)) throw new Error('Invalid notes file');

      notes = [...importedNotes.map(normalizeNote), ...notes];
      saveNotesNow();
      renderNotes(true);
      showToast('Import complete', `${importedNotes.length} notes imported.`);
    } catch (error) {
      showToast('Import failed', 'Choose a valid Smart Notes JSON file.');
    }
  });

  reader.readAsText(file);
}

/**
 * SECTION: BULK ACTIONS & REORDERING
 * Logic for managing multiple selected notes and manual sorting.
 */
function bulkUpdate(updater, title, message) {
  notes = notes.map((note) => selectedIds.has(note.id) ? updater(note) : note);
  selectedIds.clear();
  saveNotes();
  renderNotes(true);
  showToast(title, message);
}

function reorderVisibleNotes(targetId) {
  if (!draggedId || draggedId === targetId) return;

  const cards = [...document.querySelectorAll('.note-card')];
  const visibleIds = cards.map((card) => card.dataset.id);
  const fromIndex = visibleIds.indexOf(draggedId);
  const toIndex = visibleIds.indexOf(targetId);

  if (fromIndex < 0 || toIndex < 0) return;

  visibleIds.splice(toIndex, 0, visibleIds.splice(fromIndex, 1)[0]);
  activeSort = 'manual';
  sortSelect.value = 'manual';
  notes = notes.map((note) => {
    const index = visibleIds.indexOf(note.id);
    return index >= 0 ? { ...note, order: visibleIds.length - index } : note;
  });

  saveNotes();
  renderNotes(true);
  showToast('Order updated', 'Custom note order saved.');
}

/**
 * SECTION: EVENT DELEGATION
 * A single click listener that reads data-action attributes 
 * and routes every UI action to its corresponding function.
 */
function handleDelegatedAction(event) {
  const actionButton = event.target.closest('[data-action]');
  if (!actionButton) return;

  const action = actionButton.dataset.action;
  const card = actionButton.closest('[data-id]');
  const noteId = card ? card.dataset.id : null;
  const note = noteId ? notes.find((item) => item.id === noteId) : null;

  if (action === 'theme') {
    const nextTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
    applyTheme(nextTheme);
    showToast('Theme updated', `${nextTheme === 'dark' ? 'Dark' : 'Light'} mode enabled.`);
    return;
  }

  if (action === 'clear-composer') {
    resetForm();
    
    // Forcefully clear values AFTER resetForm to guarantee they are empty
    titleInput.value = '';
    categoryInput.value = '';
    bodyInput.value = '';
    noteIdInput.value = '';
    
    // Explicitly update counters so they reflect the newly emptied text area
    updateCounters();
    
    clearDraft();
    localStorage.removeItem(DRAFT_KEY); 
    
    // Hide preview panel just in case
    previewPanel.classList.add('hidden');
    
    showToast('Composer cleared', 'The draft was permanently removed from storage.');
    return;
  }

  if (action === 'toggle-filters') {
    document.querySelector('.controls').classList.toggle('filters-open');
    return;
  }

  if (action === 'export-json') {
    exportNotes();
    return;
  }

  if (action === 'import-json') {
    importFile.click();
    return;
  }

  if (action === 'cancel-edit') {
    resetForm();
    showToast('Edit cancelled', 'Composer reset.');
    return;
  }

  if (action === 'focus-composer') {
    document.getElementById('composer').scrollIntoView({ behavior: 'smooth', block: 'start' });
    titleInput.focus();
    return;
  }

  if (action === 'close-modal') {
    closeModal();
    return;
  }

  if (action === 'confirm-delete') {
    confirmDelete();
    return;
  }

  if (action === 'undo-delete') {
    undoDelete();
    actionButton.closest('.toast').remove();
    return;
  }

  if (action === 'clear-selection') {
    selectedIds.clear();
    renderNotes(true);
    return;
  }

  if (action === 'bulk-favorite') {
    bulkUpdate((item) => ({ ...item, favorite: true, updatedAt: new Date().toISOString() }), 'Favorites updated', 'Selected notes were starred.');
    return;
  }

  if (action === 'bulk-archive') {
    bulkUpdate((item) => ({ ...item, archived: true, pinned: false, updatedAt: new Date().toISOString() }), 'Notes archived', 'Selected notes moved to archive.');
    return;
  }

  if (action === 'bulk-delete') {
    bulkUpdate((item) => ({ ...item, deletedAt: new Date().toISOString(), pinned: false, archived: false }), 'Moved to trash', 'Selected notes moved to trash.');
    return;
  }

  if (!note) return;

  if (action === 'select-note') {
    actionButton.checked ? selectedIds.add(noteId) : selectedIds.delete(noteId);
    renderNotes(true);
    return;
  }

  if (action === 'pin') {
    updateNote(noteId, (item) => ({ ...item, pinned: !item.pinned }), note.pinned ? 'Note unpinned' : 'Note pinned', 'Pinned notes stay in their own section.');
  }

  if (action === 'favorite') {
    updateNote(noteId, (item) => ({ ...item, favorite: !item.favorite }), note.favorite ? 'Favorite removed' : 'Favorite added', 'Use the Favorites filter to find it fast.');
  }

  if (action === 'edit') beginEdit(note);
  if (action === 'copy') copyNote(note);
  if (action === 'duplicate') duplicateNote(note);

  if (action === 'archive') {
    updateNote(noteId, (item) => ({ ...item, archived: !item.archived, pinned: item.archived ? item.pinned : false }), note.archived ? 'Note restored' : 'Note archived', note.archived ? 'It is back in active notes.' : 'Find it with the Archived filter.');
  }

  if (action === 'restore-trash') {
    updateNote(noteId, (item) => ({ ...item, deletedAt: null }), 'Note restored', 'It is back in your notebook.');
  }

  if (action === 'delete') requestDelete(noteId);
}

/**
 * SECTION: GLOBAL EVENT LISTENERS
 * Attaching listeners to the document for search, sort, filter, 
 * drag-and-drop, and keyboard shortcuts.
 */
function updateFilter(nextFilter) {
  activeFilter = nextFilter;
  selectedIds.clear();
  filterGroup.querySelectorAll('[data-filter]').forEach((button) => {
    button.classList.toggle('active', button.dataset.filter === activeFilter);
  });
  renderNotes(true);
}

function handleKeyboard(event) {
  if (event.key === 'Escape' && noteIdInput.value) {
    resetForm();
    showToast('Edit cancelled', 'Composer reset.');
  }

  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
    event.preventDefault();
    noteForm.requestSubmit();
  }

  if (event.key === 'Enter' && event.target !== bodyInput && noteForm.contains(event.target)) {
    event.preventDefault();
    noteForm.requestSubmit();
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

const debouncedSearch = debounce((value) => {
  currentSearch = value;
  renderNotes(true);
}, 180);

document.addEventListener('click', addRipple);
document.addEventListener('click', handleDelegatedAction);
document.addEventListener('keydown', handleKeyboard);
document.addEventListener('pointermove', (event) => {
  cursorGlow.style.transform = `translate(${event.clientX}px, ${event.clientY}px)`;
  handleCardTilt(event);
});
document.addEventListener('pointerout', resetCardTilt);

document.addEventListener('dragstart', (event) => {
  const card = event.target.closest('.note-card');
  if (!card) return;
  draggedId = card.dataset.id;
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
  draggedId = null;
  document.querySelectorAll('.dragging').forEach((card) => card.classList.remove('dragging'));
});

noteForm.addEventListener('submit', handleFormSubmit);
noteForm.addEventListener('input', () => {
  updateCounters();
  saveDraft();
});

searchInput.addEventListener('input', (event) => debouncedSearch(event.target.value));

sortSelect.addEventListener('change', (event) => {
  activeSort = event.target.value;
  renderNotes(true);
});

filterGroup.addEventListener('click', (event) => {
  const filterButton = event.target.closest('[data-filter]');
  if (!filterButton) return;
  updateFilter(filterButton.dataset.filter);
});

deleteModal.addEventListener('click', (event) => {
  if (event.target === deleteModal) closeModal();
});

importFile.addEventListener('change', (event) => {
  const [file] = event.target.files;
  if (file) importNotes(file);
  importFile.value = '';
});

/**
 * SECTION: INITIALIZATION
 * Running startup logic once the window has fully loaded.
 */
window.addEventListener('load', () => {
  window.setTimeout(() => loader.classList.add('loaded'), 520);
});

applyTheme(getPreferredTheme());
loadDraft();
updateCounters();
renderNotes(true);
