import { EMPTY_STATE_COPY, FILTER_OPTIONS, PREVIEW_COPY, SORT_OPTIONS } from './config.js';
import { dom } from './dom.js';
import { appState } from './state.js';
import { getWordCount, escapeHtml, formatDate, renderMarkdown } from './utils.js';

export function populateControlOptions() {
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

export function syncPreviewToggle() {
  const previewVisible = !dom.previewPanel.classList.contains('hidden');
  dom.previewToggle.textContent = previewVisible ? PREVIEW_COPY.hide : PREVIEW_COPY.show;
  dom.previewToggle.setAttribute('aria-expanded', String(previewVisible));
}

export function syncFilterToggle() {
  const filtersOpen = dom.controlsSection.classList.contains('filters-open');
  dom.controlsToggle.textContent = filtersOpen ? 'Hide filters' : 'Filters';
  dom.controlsToggle.setAttribute('aria-expanded', String(filtersOpen));
}

export function updateCounters() {
  const words = getWordCount(dom.bodyInput.value);
  document.getElementById('word-count').textContent = `${words} ${words === 1 ? 'word' : 'words'}`;
  document.getElementById('char-count').textContent = `${dom.bodyInput.value.length} / ${dom.bodyInput.maxLength} chars`;
  dom.previewPanel.innerHTML = renderMarkdown(dom.bodyInput.value);
  syncPreviewToggle();
}

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

export function getVisibleNotes() {
  return sortNotes(appState.notes.filter((note) => matchesFilter(note) && matchesSearch(note)));
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

export function updateStats() {
  const activeNotes = appState.notes.filter((note) => !note.archived && !note.deletedAt);
  const stats = {
    total: activeNotes.length,
    pinned: activeNotes.filter((note) => note.pinned).length,
    favorites: activeNotes.filter((note) => note.favorite).length,
    archived: appState.notes.filter((note) => note.archived && !note.deletedAt).length
  };

  Object.entries(stats).forEach(([key, value]) => {
    animateNumber(dom.statEls[key], appState.lastStats[key], value);
  });

  appState.lastStats = stats;
}

export function updateFilterControls() {
  dom.filterGroup.querySelectorAll('[data-filter]').forEach((button) => {
    button.classList.toggle('active', button.dataset.filter === appState.activeFilter);
  });
}

function getEmptyStateCopy() {
  return appState.currentSearch.trim()
    ? EMPTY_STATE_COPY.search
    : EMPTY_STATE_COPY[appState.activeFilter] || EMPTY_STATE_COPY.all;
}

export function updateBulkToolbar() {
  dom.bulkToolbar.classList.toggle('hidden', appState.selectedIds.size === 0);
  dom.selectedCount.textContent = `${appState.selectedIds.size} selected`;
}

export function renderNotes(force = false) {
  const visibleNotes = getVisibleNotes();
  const pinnedNotes = appState.activeFilter === 'all'
    ? visibleNotes.filter((note) => note.pinned && !note.archived && !note.deletedAt)
    : [];
  const regularNotes = appState.activeFilter === 'all'
    ? visibleNotes.filter((note) => !note.pinned || note.archived || note.deletedAt)
    : visibleNotes;
  const signature = JSON.stringify({
    visible: visibleNotes.map((note) => [
      note.id,
      note.title,
      note.body,
      note.category,
      note.color,
      note.pinned,
      note.favorite,
      note.archived,
      note.deletedAt,
      note.updatedAt,
      note.order
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
