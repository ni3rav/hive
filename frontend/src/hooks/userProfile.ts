import { apiEditProfile } from '@/api/auth';
import { QueryKeys } from '@/lib/query-key-factory';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { User } from '@/types/auth';

export function useEditProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiEditProfile,
    onMutate: async (updates: Partial<{ name: string; email: string }>) => {
      const key = QueryKeys.userKeys().me();
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<User>(key);
      queryClient.setQueryData<User | undefined>(key, (old) =>
        old ? { ...old, ...updates } : old,
      );
      return { previous };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QueryKeys.userKeys().profile(),
      });
      queryClient.invalidateQueries({ queryKey: QueryKeys.userKeys().me() });
    },
    onError: (_err, _vars, context) => {
      const key = QueryKeys.userKeys().me();
      if (context?.previous) {
        queryClient.setQueryData<User>(key, context.previous as User);
      }
    },
  });
}
