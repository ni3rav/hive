import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  apiDeleteAIProvider,
  apiGetAIProvider,
  apiSaveAIProvider,
} from '@/api/ai';
import type { AIProviderSettings, SaveAIProviderPayload } from '@/types/ai';
import { QueryKeys } from '@/lib/query-key-factory';
import { getErrorMessage } from '@/lib/error-utils';

export function useAIProvider() {
  return useQuery({
    queryKey: QueryKeys.aiKeys().provider(),
    queryFn: apiGetAIProvider,
    retry: false,
  });
}

export function useSaveAIProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SaveAIProviderPayload) => apiSaveAIProvider(payload),
    onSuccess: (data) => {
      queryClient.setQueryData<AIProviderSettings>(
        QueryKeys.aiKeys().provider(),
        data,
      );
      toast.success('Gemini key saved');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to save Gemini key'));
    },
  });
}

export function useDeleteAIProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiDeleteAIProvider(),
    onSuccess: () => {
      queryClient.setQueryData<AIProviderSettings>(QueryKeys.aiKeys().provider(), {
        provider: 'gemini',
        hasKey: false,
        model: 'gemini-2.5-flash',
      });
      toast.success('Gemini key removed');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to remove Gemini key'));
    },
  });
}
