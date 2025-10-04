import { apiEditProfile } from '@/api/auth';
import { QueryKeys } from '@/lib/query-key-factory';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useEditProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiEditProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QueryKeys.userKeys().profile(),
      });
    },
  });
}
