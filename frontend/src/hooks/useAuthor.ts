import {
  apiCreateAuthor,
  apiDeleteAuthor,
  apiGetUserAuthors,
  apiUpdateAuthor,
} from '@/api/author';
import type { Author } from '@/types/author';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useUserAuthors() {
  return useQuery({
    queryKey: ['user-authors'],
    queryFn: apiGetUserAuthors,
  });
}

export function useCreateAuthor(data: Author) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiCreateAuthor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-authors'] });
    },
    onError: (error) => {
      toast.error('Failed to create author');
      console.error('Error creating author:', error);
    },
  });
}

export function useUpdateAuthor(authorId: string, data: Partial<Author>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiUpdateAuthor(authorId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-authors'] });
    },
    onError: (error) => {
      toast.error('Failed to update author');
      console.error('Error updating author:', error);
    },
  });
}

export function useDeleteAuthor(authorId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => apiDeleteAuthor(authorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-authors'] });
    },
    onError: (error) => {
      toast.error('Failed to delete author');
      console.error('Error deleting author:', error);
    },
  });
}
