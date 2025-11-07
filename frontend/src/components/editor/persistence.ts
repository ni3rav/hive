import type { Value } from 'platejs';

export const DEFAULT_METADATA_STORAGE_PREFIX = 'hive-editor-metadata';
export const DEFAULT_CONTENT_STORAGE_PREFIX = 'hive-editor-content';

/**
 * Generates a workspace-specific storage key
 */
export const getWorkspaceStorageKey = (
  prefix: string,
  workspaceSlug?: string,
): string => {
  if (!workspaceSlug) {
    // Fallback to legacy key for backward compatibility
    return prefix;
  }
  return `${prefix}-${workspaceSlug}`;
};

/**
 * Saves metadata for a specific workspace
 */
export const saveMetadata = (
  metadata: Record<string, unknown> | unknown,
  workspaceSlug?: string,
) => {
  try {
    const storageKey = getWorkspaceStorageKey(
      DEFAULT_METADATA_STORAGE_PREFIX,
      workspaceSlug,
    );
    localStorage.setItem(storageKey, JSON.stringify(metadata));
  } catch (error) {
    console.error('Failed to persist editor metadata', error);
  }
};

/**
 * Loads metadata for a specific workspace
 */
export const loadMetadata = (
  workspaceSlug?: string,
): Record<string, unknown> | null => {
  try {
    const storageKey = getWorkspaceStorageKey(
      DEFAULT_METADATA_STORAGE_PREFIX,
      workspaceSlug,
    );
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (error) {
    console.error('Failed to load editor metadata from storage', error);
    return null;
  }
};

/**
 * Clears metadata for a specific workspace
 */
export const clearMetadata = (workspaceSlug?: string) => {
  try {
    const storageKey = getWorkspaceStorageKey(
      DEFAULT_METADATA_STORAGE_PREFIX,
      workspaceSlug,
    );
    localStorage.removeItem(storageKey);
  } catch (error) {
    console.error('Failed to clear editor metadata', error);
  }
};

/**
 * Saves content for a specific workspace
 * Supports both Plate.js Value and Tiptap HTML string
 */
export const saveContent = (content: Value | string, workspaceSlug?: string) => {
  try {
    const storageKey = getWorkspaceStorageKey(
      DEFAULT_CONTENT_STORAGE_PREFIX,
      workspaceSlug,
    );
    // Store as-is if string (Tiptap HTML), otherwise stringify (Plate.js)
    const serialized = typeof content === 'string' ? content : JSON.stringify(content);
    localStorage.setItem(storageKey, serialized);
  } catch (error) {
    console.error('Failed to persist editor content', error);
  }
};

/**
 * Loads content for a specific workspace
 * Returns either Plate.js Value or Tiptap HTML string
 */
export const loadContent = (workspaceSlug?: string): Value | string | null => {
  try {
    const storageKey = getWorkspaceStorageKey(
      DEFAULT_CONTENT_STORAGE_PREFIX,
      workspaceSlug,
    );
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    
    // Try to parse as JSON (Plate.js), otherwise return as string (Tiptap HTML)
    try {
    return JSON.parse(raw);
    } catch {
      return raw;
    }
  } catch (error) {
    console.error('Failed to load editor content from storage', error);
    return null;
  }
};

/**
 * Clears content for a specific workspace
 */
export const clearContent = (workspaceSlug?: string) => {
  try {
    const storageKey = getWorkspaceStorageKey(
      DEFAULT_CONTENT_STORAGE_PREFIX,
      workspaceSlug,
    );
    localStorage.removeItem(storageKey);
  } catch (error) {
    console.error('Failed to clear editor content', error);
  }
};

/**
 * Clears all persistence data for a specific workspace
 */
export const clearWorkspacePersistence = (workspaceSlug?: string) => {
  clearMetadata(workspaceSlug);
  clearContent(workspaceSlug);
};

/**
 * Gets all workspace slugs that have persisted editor data
 */
export const getAllWorkspacesWithData = (): {
  slug: string;
  hasContent: boolean;
  hasMetadata: boolean;
}[] => {
  const workspaces = new Map<
    string,
    { hasContent: boolean; hasMetadata: boolean }
  >();

  try {
    // Scan localStorage for all workspace-specific keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      // Check for content keys
      if (key.startsWith(`${DEFAULT_CONTENT_STORAGE_PREFIX}-`)) {
        const slug = key.replace(`${DEFAULT_CONTENT_STORAGE_PREFIX}-`, '');
        const existing = workspaces.get(slug) || {
          hasContent: false,
          hasMetadata: false,
        };
        existing.hasContent = true;
        workspaces.set(slug, existing);
      }

      // Check for metadata keys
      if (key.startsWith(`${DEFAULT_METADATA_STORAGE_PREFIX}-`)) {
        const slug = key.replace(`${DEFAULT_METADATA_STORAGE_PREFIX}-`, '');
        const existing = workspaces.get(slug) || {
          hasContent: false,
          hasMetadata: false,
        };
        existing.hasMetadata = true;
        workspaces.set(slug, existing);
      }
    }

    return Array.from(workspaces.entries()).map(([slug, data]) => ({
      slug,
      ...data,
    }));
  } catch (error) {
    console.error('Failed to scan workspaces with data', error);
    return [];
  }
};

/**
 * Clears all workspace-specific persistence data
 * Useful for cleanup or testing
 */
export const clearAllWorkspaceData = () => {
  const workspaces = getAllWorkspacesWithData();
  workspaces.forEach((workspace) => {
    clearWorkspacePersistence(workspace.slug);
  });
};
