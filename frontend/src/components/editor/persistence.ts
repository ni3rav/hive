import type { Value } from 'platejs';

export const DEFAULT_METADATA_STORAGE_KEY = 'hive-editor-metadata';
export const DEFAULT_CONTENT_STORAGE_KEY = 'hive-editor-content';

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

export const saveContent = (
  content: Value,
  storageKey: string = DEFAULT_CONTENT_STORAGE_KEY,
) => {
  try {
    localStorage.setItem(storageKey, JSON.stringify(content));
  } catch (error) {
    console.error('Failed to persist editor content', error);
  }
};

export const loadContent = (
  storageKey: string = DEFAULT_CONTENT_STORAGE_KEY,
): Value | null => {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    console.error('Failed to load editor content from storage', error);
    return null;
  }
};

export const clearContent = (
  storageKey: string = DEFAULT_CONTENT_STORAGE_KEY,
) => {
  try {
    localStorage.removeItem(storageKey);
  } catch (error) {
    console.error('Failed to clear editor content', error);
  }
};

export const clearAllPersistence = () => {
  clearMetadata();
  clearContent();
};
