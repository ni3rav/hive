import { apiGet } from '@/lib/api-client';

export async function apiVerifyWorkspace(workspaceSlug: string) {
  return apiGet(`/workspace/verify/${workspaceSlug}`);
}
