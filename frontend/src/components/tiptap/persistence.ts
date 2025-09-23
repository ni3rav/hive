import type { Editor } from "@tiptap/core";

export const DEFAULT_TIPTAP_STORAGE_KEY = "tiptap-editor-content";

export function loadEditorContent(
  storageKey: string = DEFAULT_TIPTAP_STORAGE_KEY
) {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    console.error("Failed to load editor content from storage", error);
    return null;
  }
}

export function saveEditorContent(
  json: unknown,
  storageKey: string = DEFAULT_TIPTAP_STORAGE_KEY
) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(json));
  } catch (error) {
    console.error("Failed to persist editor content", error);
  }
}

export function clearEditorContent(
  storageKey: string = DEFAULT_TIPTAP_STORAGE_KEY
) {
  try {
    localStorage.removeItem(storageKey);
  } catch (error) {
    console.error("Failed to clear editor content", error);
  }
}

type OnCreateProps = { editor: Editor };
type OnUpdateProps = { editor: Editor };

export function createPersistenceHandlers(
  storageKey: string = DEFAULT_TIPTAP_STORAGE_KEY
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
