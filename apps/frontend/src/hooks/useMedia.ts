import { apiListMedia, apiDeleteMedia } from '@/api/media';
import type { Media } from '@/types/media';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/error-utils';
import { QueryKeys } from '@/lib/query-key-factory';

export function useMedia(workspaceSlug: string) {
  return useQuery({
    queryKey: QueryKeys.mediaKeys().list(workspaceSlug),
    queryFn: () => apiListMedia(workspaceSlug),
    retry: false,
    enabled: !!workspaceSlug,
  });
}

export function useDeleteMedia(workspaceSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (mediaId: string) => apiDeleteMedia(workspaceSlug, mediaId),
    onMutate: async (mediaId) => {
      await queryClient.cancelQueries({
        queryKey: QueryKeys.mediaKeys().list(workspaceSlug),
      });
      const previous = queryClient.getQueryData<Media[]>(
        QueryKeys.mediaKeys().list(workspaceSlug),
      );
      queryClient.setQueryData(
        QueryKeys.mediaKeys().list(workspaceSlug),
        (old: Media[] | undefined) =>
          (old || []).filter((m) => m.id !== mediaId),
      );
      return { previous };
    },
    onSuccess: () => {
      toast.success('Media deleted successfully');
    },
    onError: (error, _mediaId, ctx) => {
      const message = getErrorMessage(error, 'Failed to delete media');
      toast.error(message);
      if (ctx?.previous) {
        queryClient.setQueryData(
          QueryKeys.mediaKeys().list(workspaceSlug),
          ctx.previous,
        );
      }
    },
  });
}

