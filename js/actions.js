import { FORM_COPY, MODAL_COPY, PREVIEW_COPY, STORAGE_KEYS, TOAST_COPY } from './config.js';
import { dom } from './dom.js';
import { renderNotes, syncFilterToggle, syncPreviewToggle, updateCounters } from './rendering.js';
import { appState } from './state.js';
import {
  clearDraft,
  getSelectedColor,
  normalizeNote,
  saveNotes,
  saveNotesNow,
  setSelectedColor
} from './storage.js';
import { createId, escapeHtml, isPlainObject } from './utils.js';

export function applyTheme(theme) {
  document.body.classList.add('theme-morphing');
  const isDark = theme === 'dark';

  document.body.classList.toggle('dark', isDark);
  dom.themeIcon.textContent = isDark ? 'Light' : 'Dark';
  dom.themeToggle.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} mode`);
  localStorage.setItem(STORAGE_KEYS.theme, theme);

  window.setTimeout(() => document.body.classList.remove('theme-morphing'), appState.prefersReducedMotion ? 1 : 320);
}

function setComposerMode(mode) {
  const isEditing = mode === 'edit';
  dom.composerTitle.textContent = isEditing ? FORM_COPY.editTitle : FORM_COPY.createTitle;
  dom.saveButton.textContent = isEditing ? 'Update note' : 'Add note';
  dom.cancelEditButton.classList.toggle('hidden', !isEditing);
  dom.formMode.textContent = isEditing ? FORM_COPY.editMode : FORM_COPY.createMode;
  dom.composer.classList.toggle('editing', isEditing);
}

function hidePreview() {
  dom.previewPanel.classList.add('hidden');
  dom.previewToggle.textContent = PREVIEW_COPY.show;
  dom.previewToggle.setAttribute('aria-expanded', 'false');
}

export function togglePreview() {
  dom.previewPanel.classList.toggle('hidden');
  syncPreviewToggle();
  updateCounters();
}

export function resetForm(options = {}) {
  const { clearSavedDraft = false, hidePreviewPanel = false } = options;

  dom.noteForm.reset();
  dom.noteIdInput.value = '';
  setSelectedColor('cyan');
  setComposerMode('create');
  if (clearSavedDraft) clearDraft();
  if (hidePreviewPanel) hidePreview();
  updateCounters();
  renderNotes(true);
}

export function beginEdit(note) {
  dom.noteIdInput.value = note.id;
  dom.titleInput.value = note.title;
  dom.categoryInput.value = note.category;
  dom.bodyInput.value = note.body;
  setSelectedColor(note.color);
  setComposerMode('edit');
  updateCounters();
  renderNotes(true);
  dom.titleInput.focus();
  dom.composer.scrollIntoView({ behavior: appState.prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
}

export function showToast(title, message, options = {}) {
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

export function handleFormSubmit(event) {
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
    const note = normalizeNote({
      title,
      body,
      category,
      color,
      order: Date.now()
    });
    appState.notes = [note, ...appState.notes];
    appState.lastChangedId = note.id;
    showToast(TOAST_COPY.noteAdded.title, TOAST_COPY.noteAdded.message);
  }

  saveNotes();
  resetForm({ clearSavedDraft: true });
  renderNotes(true);
}

export function updateNote(noteId, updater, toastTitle, toastMessage) {
  appState.notes = appState.notes.map((note) => {
    if (note.id !== noteId) return note;
    return { ...updater(note), updatedAt: new Date().toISOString() };
  });
  appState.lastChangedId = noteId;
  saveNotes();
  renderNotes(true);
  showToast(toastTitle, toastMessage);
}

export function duplicateNote(note) {
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

export function requestDelete(noteId) {
  const note = appState.notes.find((item) => item.id === noteId);
  const copy = note && note.deletedAt ? MODAL_COPY.permanent : MODAL_COPY.trash;

  dom.deleteTitle.textContent = copy.title;
  dom.deleteText.textContent = copy.message;
  appState.pendingDeleteId = noteId;
  dom.deleteModal.classList.remove('hidden');
}

export function closeModal() {
  appState.pendingDeleteId = null;
  dom.deleteModal.classList.add('hidden');
}

export function confirmDelete() {
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
    if (dom.noteIdInput.value === appState.pendingDeleteId) resetForm({ clearSavedDraft: true, hidePreviewPanel: true });
    saveNotes();
    renderNotes(true);
    closeModal();
  }, appState.prefersReducedMotion ? 1 : 150);
}

export function undoDelete() {
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

export async function copyNote(note) {
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

export function exportNotes() {
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

function getImportEntries(parsed) {
  if (Array.isArray(parsed)) return parsed;
  if (isPlainObject(parsed) && Array.isArray(parsed.notes)) return parsed.notes;
  throw new Error('Invalid notes file');
}

export async function importNotes(file) {
  try {
    const parsed = JSON.parse(await file.text());
    const importedEntries = getImportEntries(parsed);
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

export function bulkUpdate(updater, title, message) {
  appState.notes = appState.notes.map((note) => appState.selectedIds.has(note.id) ? updater(note) : note);
  appState.selectedIds.clear();
  saveNotes();
  renderNotes(true);
  showToast(title, message);
}

export function reorderVisibleNotes(targetId) {
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

export function updateFilter(nextFilter) {
  appState.activeFilter = nextFilter;
  appState.selectedIds.clear();
  renderNotes(true);
}

export function toggleFilters() {
  dom.controlsSection.classList.toggle('filters-open');
  syncFilterToggle();
}

export function createActionHandlers() {
  return {
    theme() {
      const nextTheme = document.body.classList.contains('dark') ? 'light' : 'dark';
      applyTheme(nextTheme);
      const toast = TOAST_COPY.themeUpdated(nextTheme);
      showToast(toast.title, toast.message);
    },
    'toggle-preview'() {
      togglePreview();
    },
    'clear-composer'() {
      resetForm({ clearSavedDraft: true, hidePreviewPanel: true });
      showToast(TOAST_COPY.composerCleared.title, TOAST_COPY.composerCleared.message);
    },
    'toggle-filters'() {
      toggleFilters();
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
    'close-modal'() {
      closeModal();
    },
    'confirm-delete'() {
      confirmDelete();
    },
    'undo-delete'({ actionButton }) {
      undoDelete();
      actionButton.closest('.toast')?.remove();
    },
    'clear-selection'() {
      appState.selectedIds.clear();
      renderNotes(true);
    },
    'bulk-favorite'() {
      bulkUpdate(
        (item) => ({ ...item, favorite: true, updatedAt: new Date().toISOString() }),
        'Favorites updated',
        'Selected notes were starred.'
      );
    },
    'bulk-archive'() {
      bulkUpdate(
        (item) => ({ ...item, archived: true, pinned: false, updatedAt: new Date().toISOString() }),
        'Notes archived',
        'Selected notes moved to archive.'
      );
    },
    'bulk-delete'() {
      bulkUpdate(
        (item) => ({ ...item, deletedAt: new Date().toISOString(), pinned: false, archived: false }),
        'Moved to trash',
        'Selected notes moved to trash.'
      );
    },
    'select-note'({ actionButton, noteId }) {
      actionButton.checked ? appState.selectedIds.add(noteId) : appState.selectedIds.delete(noteId);
      renderNotes(true);
    },
    pin({ noteId, note }) {
      updateNote(noteId, (item) => ({ ...item, pinned: !item.pinned }), note.pinned ? 'Note unpinned' : 'Note pinned', 'Pinned notes stay in their own section.');
    },
    favorite({ noteId, note }) {
      updateNote(noteId, (item) => ({ ...item, favorite: !item.favorite }), note.favorite ? 'Favorite removed' : 'Favorite added', 'Use the Favorites filter to find it fast.');
    },
    edit({ note }) {
      beginEdit(note);
    },
    copy({ note }) {
      copyNote(note);
    },
    duplicate({ note }) {
      duplicateNote(note);
    },
    archive({ noteId, note }) {
      updateNote(
        noteId,
        (item) => ({ ...item, archived: !item.archived, pinned: item.archived ? item.pinned : false }),
        note.archived ? 'Note restored' : 'Note archived',
        note.archived ? 'It is back in active notes.' : 'Find it with the Archived filter.'
      );
    },
    'restore-trash'({ noteId }) {
      updateNote(noteId, (item) => ({ ...item, deletedAt: null }), 'Note restored', 'It is back in your notebook.');
    },
    delete({ noteId }) {
      requestDelete(noteId);
    }
  };
}
