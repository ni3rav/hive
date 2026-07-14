import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiTransformSelection } from '@/api/ai';
import type { TransformSelectionPayload } from '@/types/ai';
import { getErrorMessage } from '@/lib/error-utils';

export function useSelectionTransform() {
  return useMutation({
    mutationFn: (payload: TransformSelectionPayload) =>
      apiTransformSelection(payload),
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to transform selection'));
    },
  });
}
