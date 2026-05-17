export const STORAGE_KEYS = {
  notes: 'smart-notes-app-notes',
  theme: 'smart-notes-app-theme',
  draft: 'smart-notes-app-draft'
};

export const COLOR_NAMES = ['cyan', 'violet', 'amber', 'rose', 'emerald'];

export const FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'pinned', label: 'Pinned' },
  { value: 'favorites', label: 'Favorites' },
  { value: 'archived', label: 'Archived' },
  { value: 'recent', label: 'Recent' },
  { value: 'trash', label: 'Trash' }
];

export const SORT_OPTIONS = [
  { value: 'manual', label: 'Custom' },
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'az', label: 'A-Z' }
];

export const EMPTY_STATE_COPY = {
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

export const FORM_COPY = {
  createTitle: 'Create a note',
  createMode: 'Drafts auto-save while you type.',
  recoveredMode: 'Draft recovered from your last session.',
  editTitle: 'Edit note',
  editMode: 'Update the note and keep your latest changes in place.'
};

export const PREVIEW_COPY = {
  show: 'Preview',
  hide: 'Hide preview'
};

export const TOAST_COPY = {
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

export const MODAL_COPY = {
  trash: {
    title: 'Move this note to trash?',
    message: 'This moves the note out of your workspace. You can restore it from Trash.'
  },
  permanent: {
    title: 'Delete forever?',
    message: 'This permanently removes the note from LocalStorage.'
  }
};
