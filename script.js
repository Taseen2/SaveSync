/**
 * SaveSync - Modern Note Taking Application
 * 
 * Logic refactored for performance, accessibility, and maintainability.
 */

/* ==========================================================================
    SECTION: CONFIGURATION & CONSTANTS
    Defines the keys for local storage, color mapping for notes, 
    filter options, and messages for user feedback (toasts).
   ========================================================================== */

const STORAGE_KEYS = {
  notes: 'smart-notes-app-notes',
  theme: 'smart-notes-app-theme',
  draft: 'smart-notes-app-draft'
};

const COLOR_MAP = {
  cyan: { hex: '#3bc9db', label: 'Cyan' },
  violet: { hex: '#be4bdb', label: 'Violet' },
  amber: { hex: '#fab005', label: 'Amber' },
  rose: { hex: '#ff6b6b', label: 'Rose' },
  emerald: { hex: '#51cf66', label: 'Emerald' }
};

const COLOR_NAMES = Object.keys(COLOR_MAP);

// Content for empty states based on the active filter
const EMPTY_STATE_COPY = {
  all: { icon: '📝', title: 'No notes yet', detail: 'Start by creating your first note above.' },
  favorites: { icon: '⭐', title: 'No favorites', detail: 'Star notes you want to find quickly.' },
  archived: { icon: '📦', title: 'Archive is empty', detail: 'Keep your workspace clean by archiving old notes.' },
  recent: { icon: '🕒', title: 'No recent activity', detail: 'Notes updated in the last 7 days appear here.' },
  trash: { icon: '🗑️', title: 'Trash is empty', detail: 'Deleted notes will stay here for a while.' },
  search: { icon: '🔍', title: 'No matches found', detail: 'Try adjusting your keywords or filters.' }
};

// Toast notification messages
const TOAST_MESSAGES = {
  saved: { title: 'Note Saved', message: 'Your thoughts are safely stored.' },
  updated: { title: 'Note Updated', message: 'Changes have been applied.' },
  deleted: { title: 'Moved to Trash', message: 'Note moved. You can restore it from Trash.' },
  restored: { title: 'Note Restored', message: 'Note is back in your workspace.' },
  permanentlyDeleted: { title: 'Permanently Deleted', message: 'Note removed from storage forever.' },
  copied: { title: 'Copied to Clipboard', message: 'Note content is ready to paste.' },
  duplicate: { title: 'Note Duplicated', message: 'A fresh copy has been created.' },
  importSuccess: (count) => ({ title: 'Import Complete', message: `Successfully imported ${count} notes.` }),
  importError: { title: 'Import Failed', message: 'Please upload a valid JSON file.' },
  exportSuccess: { title: 'Export Ready', message: 'Your notes have been downloaded.' },
  errorMissingFields: { title: 'Incomplete Note', message: 'Please provide both a title and some content.' }
};

/* ==========================================================================
   SECTION: DOM ELEMENTS
   Maps HTML elements to a central 'dom' object for easy access.
   ========================================================================== */

const dom = {
  // Global elements
  loader: document.getElementById('startup-loader'),
  cursorGlow: document.getElementById('cursor-glow'),
  themeToggle: document.getElementById('theme-toggle'),
  themeIcon: document.querySelector('.theme-icon'),
  
  // Composer (Note Form) elements
  composer: document.getElementById('composer'),
  composerTitle: document.getElementById('composer-title'),
  formModeText: document.getElementById('form-mode'),
  noteForm: document.getElementById('note-form'),
  noteIdInput: document.getElementById('note-id'),
  titleInput: document.getElementById('note-title'),
  categoryInput: document.getElementById('note-category'),
  bodyInput: document.getElementById('note-body'),
  cancelEditBtn: document.getElementById('cancel-edit'),
  saveBtn: document.getElementById('save-note'),
  
  // Controls (Search/Filter/Sort) elements
  searchInput: document.getElementById('search-notes'),
  filterGroup: document.getElementById('filter-group'),
  sortSelect: document.getElementById('sort-notes'),
  
  // Notes List elements
  notesCount: document.getElementById('notes-count'),
  pinnedSection: document.getElementById('pinned-section'),
  pinnedContainer: document.getElementById('pinned-notes'),
  notesContainer: document.getElementById('notes-container'),
  emptyState: document.getElementById('empty-state'),
  bulkToolbar: document.getElementById('bulk-toolbar'),
  selectedCountText: document.getElementById('selected-count'),
  
  // Stats elements
  stats: {
    total: document.getElementById('total-stat'),
    pinned: document.getElementById('pinned-stat'),
    favorites: document.getElementById('favorite-stat'),
    archived: document.getElementById('archived-stat')
  },
  
  // Modals & Overlays elements
  toastStack: document.getElementById('toast-stack'),
  deleteModal: document.getElementById('delete-modal'),
  deleteTitle: document.getElementById('delete-title'),
  deleteText: document.getElementById('delete-text'),
  readModal: document.getElementById('read-modal'),
  readTitle: document.getElementById('read-title'),
  readBody: document.getElementById('read-body'),
  readBadges: document.getElementById('read-badges'),
  readMeta: document.getElementById('read-meta'),
  importFileInput: document.getElementById('import-file')
};

/* ==========================================================================
   SECTION: APPLICATION STATE
   Holds the current data and view settings of the application.
   ========================================================================== */

const state = {
  notes: [], // Array of note objects
  filter: 'all', // Current filter category
  sort: 'manual', // Current sort order
  searchQuery: '', // Current search text
  selectedIds: new Set(), // IDs of notes selected for bulk actions
  editingId: null, // ID of the note currently being edited
  isDark: false, // Dark theme status
  lastStats: { total: 0, pinned: 0, favorites: 0, archived: 0 } // Previous stats for animation
};

/* ==========================================================================
   SECTION: UTILITIES
   Helper functions for common tasks like ID generation, data formatting, 
   and UI enhancements.
   ========================================================================== */

const utils = {
  // Generates a unique ID using crypto API or a fallback method
  generateId: () => crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  
  // Prevents a function from being called too frequently
  debounce: (fn, delay = 200) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn.apply(this, args), delay);
    };
  },
  
  // Escapes HTML special characters to prevent XSS attacks
  escapeHtml: (str) => {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },
  
  // Formats a date string into a readable format
  formatDate: (dateStr) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateStr));
  },
  
  // Adds a ripple effect to buttons and interactive elements
  addRipple: (event) => {
    const target = event.target.closest('.button, .filter-chip, .badge, .note-action, .fab');
    if (!target) return;
    
    const rect = target.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size = Math.max(rect.width, rect.height);
    
    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${event.clientX - rect.left}px`;
    ripple.style.top = `${event.clientY - rect.top}px`;
    
    target.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  },
  
  // Simple markdown renderer for note content
  renderMarkdown: (text) => {
    const safe = utils.escapeHtml(text);
    return safe
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
};

/* ==========================================================================
   SECTION: CORE LOGIC
   The main application object containing initialization, rendering, 
   and note management methods.
   ========================================================================== */

const app = {
  // Application entry point
  init() {
    this.loadData();
    this.setupListeners();
    this.render();
    this.loadDraft();
    this.applyTheme(this.getInitialTheme());
    
    // Hide the startup loader after a brief delay
    setTimeout(() => {
      dom.loader.classList.add('loaded');
    }, 600);
  },

  // Loads notes from local storage
  loadData() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.notes);
      state.notes = saved ? JSON.parse(saved) : [];
      // Normalize note objects to ensure all required properties exist
      state.notes = state.notes.map(n => ({
        ...n,
        id: n.id || utils.generateId(),
        color: COLOR_NAMES.includes(n.color) ? n.color : 'cyan',
        pinned: !!n.pinned,
        favorite: !!n.favorite,
        archived: !!n.archived,
        deletedAt: n.deletedAt || null,
        order: n.order || Date.now()
      }));
    } catch (e) {
      console.error('Failed to load notes:', e);
      state.notes = [];
    }
  },

  // Saves notes to local storage
  saveData() {
    localStorage.setItem(STORAGE_KEYS.notes, JSON.stringify(state.notes));
    this.updateStats();
  },

  // Determines the initial theme based on local storage or system preference
  getInitialTheme() {
    const saved = localStorage.getItem(STORAGE_KEYS.theme);
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  },

  // Applies the dark or light theme to the body and saves preference
  applyTheme(isDark) {
    state.isDark = isDark;
    document.body.classList.add('theme-morphing');
    document.body.classList.toggle('dark', isDark);
    dom.themeIcon.textContent = isDark ? 'Light' : 'Dark';
    localStorage.setItem(STORAGE_KEYS.theme, isDark ? 'dark' : 'light');
    
    setTimeout(() => {
      document.body.classList.remove('theme-morphing');
    }, 500);
  },

  /* --- Rendering --- */

  // Refreshes the UI by rendering notes, updating stats, and toolbar
  render() {
    this.renderNotes();
    this.updateStats();
    this.updateBulkToolbar();
  },

  // Filters, sorts, and renders notes into the DOM
  renderNotes() {
    const filtered = this.getFilteredNotes();
    const sorted = this.getSortedNotes(filtered);
    
    // Separate pinned and regular notes
    const pinned = sorted.filter(n => n.pinned && !n.archived && !n.deletedAt);
    const regular = sorted.filter(n => !n.pinned || n.archived || n.deletedAt);

    // Filter notes based on the search query
    const query = state.searchQuery.toLowerCase();
    const searchFilter = n => 
      n.title.toLowerCase().includes(query) || 
      n.body.toLowerCase().includes(query) || 
      n.category.toLowerCase().includes(query);

    // Apply search filter to pinned and regular lists
    const visiblePinned = state.filter === 'all' ? pinned.filter(searchFilter) : [];
    const visibleRegular = state.filter === 'all' 
      ? regular.filter(searchFilter) 
      : sorted.filter(searchFilter);

    // Show/hide the pinned section based on visibility
    dom.pinnedSection.classList.toggle('hidden', visiblePinned.length === 0);
    
    // Inject rendered HTML into the containers
    dom.pinnedContainer.innerHTML = visiblePinned.map((n, i) => this.createNoteCard(n, i)).join('');
    dom.notesContainer.innerHTML = visibleRegular.map((n, i) => this.createNoteCard(n, i + visiblePinned.length)).join('');

    // Update the note count text
    const totalVisible = visiblePinned.length + visibleRegular.length;
    dom.notesCount.textContent = `${totalVisible} note${totalVisible !== 1 ? 's' : ''} found`;
    
    // Show empty state if no notes are visible
    dom.emptyState.classList.toggle('hidden', totalVisible > 0);
    if (totalVisible === 0) {
      const copy = state.searchQuery ? EMPTY_STATE_COPY.search : (EMPTY_STATE_COPY[state.filter] || EMPTY_STATE_COPY.all);
      dom.emptyState.innerHTML = `
        <div class="empty-icon">${copy.icon}</div>
        <h3>${copy.title}</h3>
        <p>${copy.detail}</p>
      `;
    }
  },

  // Generates the HTML for a single note card
  createNoteCard(note, index) {
    const isSelected = state.selectedIds.has(note.id);
    const badges = [];
    if (note.pinned) badges.push('Pinned');
    if (note.favorite) badges.push('Favorite');
    if (note.archived) badges.push('Archived');
    if (note.deletedAt) badges.push('Trash');
    
    return `
      <article class="note-card ${isSelected ? 'selected' : ''}" 
               data-id="${note.id}" 
               data-color="${note.color}" 
               style="--stagger: ${index * 40}ms"
               onclick="app.openReadModal('${note.id}')">
        <div class="note-topline">
          <div class="note-badges">
            <span class="note-badge">${utils.escapeHtml(note.category || 'General')}</span>
            ${badges.map(b => `<span class="note-badge">${b}</span>`).join('')}
          </div>
          <input type="checkbox" aria-label="Select note" 
                 ${isSelected ? 'checked' : ''} 
                 onclick="event.stopPropagation(); app.toggleSelect('${note.id}')">
        </div>
        <h4>${utils.escapeHtml(note.title)}</h4>
        <div class="note-body">${utils.renderMarkdown(note.body)}</div>
        <div class="note-meta">
          <span>${utils.formatDate(note.updatedAt || note.createdAt)}</span>
        </div>
        <div class="note-actions">
          <button class="note-action" data-tooltip="Pin" onclick="event.stopPropagation(); app.togglePin('${note.id}')">${note.pinned ? '📌' : '📍'}</button>
          <button class="note-action" data-tooltip="Favorite" onclick="event.stopPropagation(); app.toggleFavorite('${note.id}')">${note.favorite ? '★' : '☆'}</button>
          <button class="note-action" data-tooltip="Archive" onclick="event.stopPropagation(); app.toggleArchive('${note.id}')">${note.archived ? '📥' : '📦'}</button>
          <button class="note-action" data-tooltip="Duplicate" onclick="event.stopPropagation(); app.duplicateNote('${note.id}')">📋</button>
          <button class="note-action" data-tooltip="Copy" onclick="event.stopPropagation(); app.copyNote('${note.id}')">✂</button>
          <button class="note-action" data-tooltip="Edit" onclick="event.stopPropagation(); app.startEdit('${note.id}')">✎</button>
          <button class="note-action" data-tooltip="Delete" onclick="event.stopPropagation(); app.deleteNote('${note.id}')">🗑</button>
        </div>
      </article>
    `;
  },

  // Returns notes filtered by the current application filter
  getFilteredNotes() {
    switch (state.filter) {
      case 'favorites': return state.notes.filter(n => n.favorite && !n.deletedAt);
      case 'archived': return state.notes.filter(n => n.archived && !n.deletedAt);
      case 'recent': {
        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        return state.notes.filter(n => new Date(n.updatedAt || n.createdAt) > weekAgo && !n.deletedAt);
      }
      case 'trash': return state.notes.filter(n => n.deletedAt);
      default: return state.notes.filter(n => !n.deletedAt && !n.archived);
    }
  },

  // Returns notes sorted by the current application sort setting
  getSortedNotes(notes) {
    const list = [...notes];
    switch (state.sort) {
      case 'newest': return list.sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));
      case 'oldest': return list.sort((a, b) => new Date(a.updatedAt || a.createdAt) - new Date(b.updatedAt || b.createdAt));
      case 'az': return list.sort((a, b) => a.title.localeCompare(b.title));
      case 'color': return list.sort((a, b) => COLOR_NAMES.indexOf(a.color) - COLOR_NAMES.indexOf(b.color));
      default: return list.sort((a, b) => b.order - a.order);
    }
  },

  // Updates the stats row with the latest numbers using a smooth animation
  updateStats() {
    const activeNotes = state.notes.filter(n => !n.deletedAt);
    const stats = {
      total: activeNotes.length,
      pinned: activeNotes.filter(n => n.pinned).length,
      favorites: activeNotes.filter(n => n.favorite).length,
      archived: activeNotes.filter(n => n.archived).length
    };

    Object.keys(stats).forEach(key => {
      const el = dom.stats[key];
      if (el) {
        this.animateValue(el, state.lastStats[key], stats[key], 600);
      }
    });
    state.lastStats = stats;
  },

  // Optimized numerical animation using performance.now()
  animateValue(el, start, end, duration) {
    if (start === end) return;
    let startTime = null;

    const step = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3); // Cubic ease-out
      
      const currentVal = Math.floor(easeProgress * (end - start) + start);
      el.innerText = currentVal.toLocaleString();
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  },

  /* --- Actions --- */

  // Handles note form submission (create or update)
  handleFormSubmit(e) {
    e.preventDefault();
    const title = dom.titleInput.value.trim();
    const body = dom.bodyInput.value.trim();
    const category = dom.categoryInput.value.trim();
    const color = document.querySelector('input[name="color"]:checked')?.value || 'cyan';

    if (!title || !body) {
      this.showToast(TOAST_MESSAGES.errorMissingFields);
      return;
    }

    const now = new Date().toISOString();

    if (state.editingId) {
      // Update existing note
      state.notes = state.notes.map(n => n.id === state.editingId ? {
        ...n, title, body, category, color, updatedAt: now
      } : n);
      this.showToast(TOAST_MESSAGES.updated);
    } else {
      // Create new note
      const newNote = {
        id: utils.generateId(),
        title, body, category, color,
        pinned: false, favorite: false, archived: false,
        createdAt: now, updatedAt: now,
        order: Date.now()
      };
      state.notes.unshift(newNote);
      this.showToast(TOAST_MESSAGES.saved);
    }

    this.saveData();
    this.resetForm();
    this.render();
  },

  // Populates the form with note data for editing
  startEdit(id) {
    const note = state.notes.find(n => n.id === id);
    if (!note) return;

    state.editingId = id;
    dom.noteIdInput.value = id;
    dom.titleInput.value = note.title;
    dom.categoryInput.value = note.category;
    dom.bodyInput.value = note.body;
    
    const colorInput = document.querySelector(`input[name="color"][value="${note.color}"]`);
    if (colorInput) colorInput.checked = true;

    dom.composerTitle.textContent = 'Edit Note';
    dom.saveBtn.textContent = 'Update Note';
    dom.cancelEditBtn.classList.remove('hidden');

    dom.composer.scrollIntoView({ behavior: 'smooth' });
    dom.titleInput.focus();
  },

  // Clears the note form and resets state
  resetForm() {
    state.editingId = null;
    dom.noteForm.reset();
    dom.noteIdInput.value = '';
    dom.composerTitle.textContent = 'Create a note';
    dom.saveBtn.textContent = 'Add Note';
    dom.cancelEditBtn.classList.add('hidden');
    localStorage.removeItem(STORAGE_KEYS.draft);
  },

  // Moves a note to trash or deletes it permanently
  deleteNote(id) {
    const note = state.notes.find(n => n.id === id);
    if (!note) return;

    if (note.deletedAt) {
      // Permanent delete if already in trash
      if (confirm('Permanently delete this note? This cannot be undone.')) {
        state.notes = state.notes.filter(n => n.id !== id);
        this.showToast(TOAST_MESSAGES.permanentlyDeleted);
      }
    } else {
      // Move to trash
      state.notes = state.notes.map(n => n.id === id ? { ...n, deletedAt: new Date().toISOString(), pinned: false } : n);
      this.showToast(TOAST_MESSAGES.deleted);
    }

    this.saveData();
    this.render();
  },

  // Toggles the favorite status of a note
  toggleFavorite(id) {
    state.notes = state.notes.map(n => n.id === id ? { ...n, favorite: !n.favorite } : n);
    this.saveData();
    this.render();
  },

  // Toggles the pinned status of a note
  togglePin(id) {
    state.notes = state.notes.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n);
    this.saveData();
    this.render();
  },

  // Toggles the archived status of a note
  toggleArchive(id) {
    state.notes = state.notes.map(n => n.id === id ? { ...n, archived: !n.archived, pinned: false } : n);
    this.saveData();
    this.render();
  },

  // Creates a duplicate of an existing note
  duplicateNote(id) {
    const note = state.notes.find(n => n.id === id);
    if (!note) return;
    const copy = { 
      ...note, 
      id: utils.generateId(), 
      title: `${note.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      order: Date.now()
    };
    state.notes.unshift(copy);
    this.saveData();
    this.render();
    this.showToast(TOAST_MESSAGES.duplicate);
  },

  // Copies the note content to the system clipboard
  async copyNote(id) {
    const note = state.notes.find(n => n.id === id);
    if (!note) return;
    try {
      await navigator.clipboard.writeText(`${note.title}\n\n${note.body}`);
      this.showToast(TOAST_MESSAGES.copied);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  },

  // Toggles note selection for bulk actions
  toggleSelect(id) {
    if (state.selectedIds.has(id)) state.selectedIds.delete(id);
    else state.selectedIds.add(id);
    this.render();
  },

  // Updates the visibility and count of the bulk action toolbar
  updateBulkToolbar() {
    const count = state.selectedIds.size;
    dom.bulkToolbar.classList.toggle('hidden', count === 0);
    dom.selectedCountText.textContent = `${count} selected`;
  },

  /* --- Modals --- */

  // Opens the read-only view modal for a note
  openReadModal(id) {
    const note = state.notes.find(n => n.id === id);
    if (!note) return;

    dom.readTitle.textContent = note.title;
    dom.readBody.innerHTML = utils.renderMarkdown(note.body);
    dom.readMeta.textContent = `Last edited: ${utils.formatDate(note.updatedAt || note.createdAt)}`;
    
    const badges = [];
    badges.push(`<span class="note-badge">${utils.escapeHtml(note.category || 'General')}</span>`);
    if (note.pinned) badges.push('<span class="note-badge">Pinned</span>');
    if (note.favorite) badges.push('<span class="note-badge">Favorite</span>');
    
    dom.readBadges.innerHTML = badges.join('');
    
    // Set actions for the modal buttons
    const deleteBtn = dom.readModal.querySelector('[data-action="delete-from-modal"]');
    const editBtn = dom.readModal.querySelector('[data-action="edit-from-modal"]');
    
    deleteBtn.onclick = () => { this.deleteNote(id); this.closeModal('read-modal'); };
    editBtn.onclick = () => { this.startEdit(id); this.closeModal('read-modal'); };

    dom.readModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  },

  // Closes a specific modal by ID
  closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
    document.body.style.overflow = '';
  },

  /* --- Feedback --- */

  // Displays a toast notification with a title and message
  showToast({ title, message }) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<strong>${title}</strong><span>${message}</span>`;
    dom.toastStack.appendChild(toast);
    
    // Animate out and remove after 3 seconds
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(20px)';
      setTimeout(() => toast.remove(), 400);
    }, 3000);
  },

  /* --- Drafts & Persistence --- */

  // Saves the current form state as a draft (only for new notes)
  saveDraft() {
    if (state.editingId) return;
    const draft = {
      title: dom.titleInput.value,
      category: dom.categoryInput.value,
      body: dom.bodyInput.value,
      color: document.querySelector('input[name="color"]:checked')?.value
    };
    localStorage.setItem(STORAGE_KEYS.draft, JSON.stringify(draft));
  },

  // Loads a saved draft into the form
  loadDraft() {
    const saved = localStorage.getItem(STORAGE_KEYS.draft);
    if (saved) {
      const draft = JSON.parse(saved);
      dom.titleInput.value = draft.title || '';
      dom.categoryInput.value = draft.category || '';
      dom.bodyInput.value = draft.body || '';
      if (draft.color) {
        const input = document.querySelector(`input[name="color"][value="${draft.color}"]`);
        if (input) input.checked = true;
      }
    }
  },

  /* --- Events --- */

  // Attaches event listeners to DOM elements
  setupListeners() {
    // Add ripple effect to interactive elements on click
    document.addEventListener('click', (e) => utils.addRipple(e));

    // Form submission
    dom.noteForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
    
    // Auto-save drafts as the user types
    dom.noteForm.addEventListener('input', utils.debounce(() => {
      this.saveDraft();
    }, 300));

    // Live search filtering
    dom.searchInput.addEventListener('input', utils.debounce((e) => {
      state.searchQuery = e.target.value;
      this.renderNotes();
    }, 200));

    // Category filtering via chips
    dom.filterGroup.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-chip');
      if (!btn) return;
      state.filter = btn.dataset.filter;
      dom.filterGroup.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this.renderNotes();
    });

    // Sorting selection change
    dom.sortSelect.addEventListener('change', (e) => {
      state.sort = e.target.value;
      this.renderNotes();
    });

    // Dark/Light theme toggle
    dom.themeToggle.addEventListener('click', () => this.applyTheme(!state.isDark));

    // Global click delegation for data-action buttons
    document.addEventListener('click', (e) => {
      const action = e.target.closest('[data-action]')?.dataset.action;
      if (!action) return;

      switch (action) {
        case 'clear-composer': this.resetForm(); break;
        case 'cancel-edit': this.resetForm(); break;
        case 'close-modal': this.closeModal(e.target.closest('.modal-backdrop').id); break;
        case 'export-json': this.exportNotes(); break;
        case 'import-json': dom.importFileInput.click(); break;
        case 'jump-to-notes': dom.notesContainer.scrollIntoView({ behavior: 'smooth' }); break;
        case 'clear-all-notes': this.clearAllNotes(); break;
        case 'bulk-favorite': this.bulkUpdate({ favorite: true }); break;
        case 'bulk-archive': this.bulkUpdate({ archived: true, pinned: false }); break;
        case 'bulk-delete': this.bulkUpdate({ deletedAt: new Date().toISOString(), pinned: false }); break;
        case 'clear-selection': state.selectedIds.clear(); this.render(); break;
        case 'focus-composer': dom.composer.scrollIntoView({ behavior: 'smooth' }); dom.titleInput.focus(); break;
      }
    });

    // File import handling
    dom.importFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) this.importNotes(file);
    });

    // Keyboard shortcuts (Escape to close modals)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modal = document.querySelector('.modal-backdrop:not(.hidden)');
        if (modal) this.closeModal(modal.id);
      }
    });

    // Mouse movement for cursor glow effect
    document.addEventListener('pointermove', (e) => {
      dom.cursorGlow.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    });
  },

  /* --- Advanced Features --- */

  // Exports all notes to a JSON file
  exportNotes() {
    const data = JSON.stringify(state.notes, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `savesync-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    this.showToast(TOAST_MESSAGES.exportSuccess);
  },

  // Imports notes from a JSON file
  async importNotes(file) {
    try {
      const text = await file.text();
      const notes = JSON.parse(text);
      if (!Array.isArray(notes)) throw new Error();
      
      // Only import notes that don't already exist (by ID)
      const newNotes = notes.filter(n => !state.notes.some(existing => existing.id === n.id));
      state.notes = [...newNotes, ...state.notes];
      this.saveData();
      this.render();
      this.showToast(TOAST_MESSAGES.importSuccess(newNotes.length));
    } catch (e) {
      this.showToast(TOAST_MESSAGES.importError);
    }
    dom.importFileInput.value = '';
  },

  // Deletes all notes after confirmation
  clearAllNotes() {
    if (confirm('Delete ALL notes? This cannot be undone.')) {
      state.notes = [];
      this.saveData();
      this.render();
      this.showToast({ title: 'Workspace Cleared', message: 'All notes have been removed.' });
    }
  },

  // Applies changes to all currently selected notes
  bulkUpdate(changes) {
    const count = state.selectedIds.size;
    if (count === 0) return;

    state.notes = state.notes.map(n => 
      state.selectedIds.has(n.id) ? { ...n, ...changes, updatedAt: new Date().toISOString() } : n
    );
    
    state.selectedIds.clear();
    this.saveData();
    this.render();
    this.showToast({ 
      title: 'Bulk Action Complete', 
      message: `Updated ${count} note${count !== 1 ? 's' : ''}.` 
    });
  }
};

// Initialize the Application
app.init();
