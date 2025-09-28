import { apiEditProfile } from '@/api/auth';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useEditProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: apiEditProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}
