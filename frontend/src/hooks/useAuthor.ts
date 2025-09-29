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
    queryFn: async () => {
      try {
        const raw = await apiGetUserAuthors();
        const normalized = (Array.isArray(raw) ? raw : []).map((a: Partial<Author>) => ({
          ...a,
          id: a?.id ?? (a as { authorId?: string }).authorId, 
        })) as Author[];
        return normalized;
      } catch (error: unknown) {
        interface ErrorWithResponse {
          response?: {
            status?: number;
            [key: string]: unknown;
          };
          [key: string]: unknown;
        }
        if (
          typeof error === 'object' &&
          error !== null &&
          'response' in error &&
          typeof (error as ErrorWithResponse).response === 'object' &&
          (error as ErrorWithResponse).response !== null &&
          'status' in (error as ErrorWithResponse).response! &&
          (error as ErrorWithResponse).response!.status === 404
        ) {
          throw new Error('NOT_FOUND');
        }
        throw error;
      }
    },
    retry: false,
  });
}

export function useCreateAuthor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Author) => apiCreateAuthor(data),
    onSuccess: () => {
      toast.success('Author created');
      queryClient.invalidateQueries({ queryKey: ['user-authors'] });
    },
    onError: (error) => {
      toast.error('Failed to create author');
      console.error('Error creating author:', error);
    },
  });
}

export function useUpdateAuthor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ authorId, data }: { authorId: string; data: Partial<Author> }) =>
      apiUpdateAuthor(authorId, data),
    onSuccess: () => {
      toast.success('Author updated');
      queryClient.invalidateQueries({ queryKey: ['user-authors'] });
    },
    onError: (error) => {
      toast.error('Failed to update author');
      console.error('Error updating author:', error);
    },
  });
}

export function useDeleteAuthor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (authorId: string) => apiDeleteAuthor(authorId),
    onSuccess: () => {
      toast.success('Author deleted');
      queryClient.invalidateQueries({ queryKey: ['user-authors'] });
    },
    onError: (error) => {
      toast.error('Failed to delete author');
      console.error('Error deleting author:', error);
    },
  });
}