export const DEFAULT_METADATA_STORAGE_KEY = 'hive-editor-metadata';

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
  clearMetadata();
};
