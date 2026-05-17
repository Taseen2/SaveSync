import { COLOR_NAMES, FORM_COPY, STORAGE_KEYS } from './config.js';
import { dom } from './dom.js';
import { appState } from './state.js';
import { createId, debounce, isPlainObject } from './utils.js';

export function normalizeNote(note, index = 0) {
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

export function loadNotes() {
  try {
    const savedNotes = JSON.parse(localStorage.getItem(STORAGE_KEYS.notes));
    return Array.isArray(savedNotes) ? savedNotes.map(normalizeNote) : [];
  } catch (error) {
    return [];
  }
}

export function saveNotesNow() {
  localStorage.setItem(STORAGE_KEYS.notes, JSON.stringify(appState.notes));
}

const scheduleSaveNotes = debounce(saveNotesNow, 220);

export function saveNotes() {
  scheduleSaveNotes();
}

export function saveDraft() {
  if (dom.noteIdInput.value) return;

  const draft = {
    title: dom.titleInput.value,
    category: dom.categoryInput.value,
    body: dom.bodyInput.value,
    color: getSelectedColor()
  };

  localStorage.setItem(STORAGE_KEYS.draft, JSON.stringify(draft));
}

export function loadDraft() {
  try {
    const draft = JSON.parse(localStorage.getItem(STORAGE_KEYS.draft));
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

export function clearDraft() {
  localStorage.removeItem(STORAGE_KEYS.draft);
}

export function getPreferredTheme() {
  const savedTheme = localStorage.getItem(STORAGE_KEYS.theme);
  if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function getSelectedColor() {
  const selected = dom.noteForm.querySelector('input[name="color"]:checked');
  return selected ? selected.value : 'cyan';
}

export function setSelectedColor(color) {
  const selectedColor = COLOR_NAMES.includes(color) ? color : 'cyan';
  const input = dom.noteForm.querySelector(`input[name="color"][value="${selectedColor}"]`);
  if (input) input.checked = true;
}
