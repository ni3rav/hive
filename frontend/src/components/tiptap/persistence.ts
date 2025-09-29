import type { Editor } from '@tiptap/core';

export const DEFAULT_EDITOR_STORAGE_KEY = 'hive-editor-content';
export const DEFAULT_METADATA_STORAGE_KEY = 'hive-editor-metadata';

export function loadEditorContent(
  storageKey: string = DEFAULT_EDITOR_STORAGE_KEY,
) {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    console.error('Failed to load editor content from storage', error);
    return null;
  }
}

export function saveEditorContent(
  json: unknown,
  storageKey: string = DEFAULT_EDITOR_STORAGE_KEY,
) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(json));
  } catch (error) {
    console.error('Failed to persist editor content', error);
  }
}

export function clearEditorContent(
  storageKey: string = DEFAULT_EDITOR_STORAGE_KEY,
) {
  try {
    localStorage.removeItem(storageKey);
  } catch (error) {
    console.error('Failed to clear editor content', error);
  }
}

type OnCreateProps = { editor: Editor };
type OnUpdateProps = { editor: Editor };

export function createPersistenceHandlers(
  storageKey: string = DEFAULT_EDITOR_STORAGE_KEY,
) {
  return {
    onCreate: ({ editor }: OnCreateProps) => {
      const json = loadEditorContent(storageKey);
      if (json) {
        editor.commands.setContent(json, false);
      }
    },
    onUpdate: ({ editor }: OnUpdateProps) => {
      const plainText = editor.getText().trim();
      if (!plainText) {
        clearEditorContent(storageKey);
        return;
      }
      const json = editor.getJSON();
      saveEditorContent(json, storageKey);
    },
  } as const;
}

export const saveMetadata = (
  metadata: Record<string, unknown>,
  storageKey: string = DEFAULT_METADATA_STORAGE_KEY,
) => {
  try {
    localStorage.setItem(storageKey, JSON.stringify(metadata));
  } catch (error) {
    console.error('Failed to persist editor metadata', error);
  }
};

export const loadMetadata = (
  storageKey: string = DEFAULT_METADATA_STORAGE_KEY,
) => {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    console.error('Failed to load editor metadata from storage', error);
    return null;
  }
};

export const clearMetadata = (
  storageKey: string = DEFAULT_METADATA_STORAGE_KEY,
) => {
  try {
    localStorage.removeItem(storageKey);
  } catch (error) {
    console.error('Failed to clear editor metadata', error);
  }
};

export const clearAllPersistence = () => {
  clearEditorContent();
  clearMetadata();
};
