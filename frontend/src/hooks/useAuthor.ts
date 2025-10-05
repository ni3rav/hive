import {
  apiCreateAuthor,
  apiDeleteAuthor,
  apiGetUserAuthors,
  apiUpdateAuthor,
} from '@/api/author';
import type { CreateAuthorData } from '@/types/author';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/error-utils';
import { QueryKeys } from '@/lib/query-key-factory';

export function useUserAuthors() {
  return useQuery({
    queryKey: QueryKeys.authorKeys().base,
    queryFn: apiGetUserAuthors,
    retry: false,
  });
}

export function useCreateAuthor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAuthorData) => apiCreateAuthor(data),
    onSuccess: () => {
      toast.success('Author created');
      queryClient.invalidateQueries({ queryKey: QueryKeys.authorKeys().base });
    },
    onError: (error) => {
      const message = getErrorMessage(error, 'Failed to create author');
      toast.error(message);
      console.error('Error creating author:', error);
    },
  });
}

export function useUpdateAuthor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      authorId,
      data,
    }: {
      authorId: string;
      data: Partial<CreateAuthorData>;
    }) => apiUpdateAuthor(authorId, data),
    onSuccess: () => {
      toast.success('Author updated');
      queryClient.invalidateQueries({ queryKey: QueryKeys.authorKeys().base });
    },
    onError: (error) => {
      const message = getErrorMessage(error, 'Failed to update author');
      toast.error(message);
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
      queryClient.invalidateQueries({ queryKey: QueryKeys.authorKeys().base });
    },
    onError: (error) => {
      const message = getErrorMessage(error, 'Failed to delete author');
      toast.error(message);
      console.error('Error deleting author:', error);
    },
  });
}
