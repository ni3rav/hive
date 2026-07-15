import { describe, it, expect } from 'vitest';
import { createWorkspaceSchema } from '../src/workspace';

describe('workspace schemas', () => {
  describe('createWorkspaceSchema', () => {
    it('validates correct workspace data', () => {
      const result = createWorkspaceSchema.safeParse({
        workspaceName: 'My Workspace',
        workspaceSlug: 'my-workspace',
      });
      expect(result.success).toBe(true);
    });

    it('rejects short name', () => {
      const result = createWorkspaceSchema.safeParse({
        workspaceName: 'AB',
        workspaceSlug: 'my-workspace',
      });
      expect(result.success).toBe(false);
    });

    it('rejects short slug', () => {
      const result = createWorkspaceSchema.safeParse({
        workspaceName: 'My Workspace',
        workspaceSlug: 'ab',
      });
      expect(result.success).toBe(false);
    });

    it('rejects slug with consecutive hyphens', () => {
      const result = createWorkspaceSchema.safeParse({
        workspaceName: 'My Workspace',
        workspaceSlug: 'my--workspace',
      });
      expect(result.success).toBe(false);
    });

    it('allows slug with single hyphens', () => {
      const result = createWorkspaceSchema.safeParse({
        workspaceName: 'My Workspace',
        workspaceSlug: 'my-workspace',
      });
      expect(result.success).toBe(true);
    });

    it('rejects slug starting with hyphen', () => {
      const result = createWorkspaceSchema.safeParse({
        workspaceName: 'My Workspace',
        workspaceSlug: '-my-workspace',
      });
      expect(result.success).toBe(false);
    });

    it('rejects slug ending with hyphen', () => {
      const result = createWorkspaceSchema.safeParse({
        workspaceName: 'My Workspace',
        workspaceSlug: 'my-workspace-',
      });
      expect(result.success).toBe(false);
    });
  });
});
