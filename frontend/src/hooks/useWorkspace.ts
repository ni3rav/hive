import { useQuery } from '@tanstack/react-query';
import { apiVerifyWorkspace } from '@/api/workspace';
import { QueryKeys } from '@/lib/query-key-factory';

export function useWorkspaceVerification(workspaceSlug?: string) {
  return useQuery({
    queryKey: QueryKeys.workspaceKeys().verify(workspaceSlug!),
    queryFn: () => apiVerifyWorkspace(workspaceSlug!),
    enabled: !!workspaceSlug,
    retry: false,
  });
}
