import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiAnalyzePost } from '@/api/ai';
import type { AnalyzePostPayload } from '@/types/ai';
import { getErrorMessage } from '@/lib/error-utils';

export function usePostAnalysis() {
  return useMutation({
    mutationFn: (payload: AnalyzePostPayload) => apiAnalyzePost(payload),
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to analyze post'));
    },
  });
}
