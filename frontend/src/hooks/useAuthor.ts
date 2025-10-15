import {
  apiCreateAuthor,
  apiDeleteAuthor,
  apiGetWorkspaceAuthors,
  apiUpdateAuthor,
} from '@/api/author';
import type { Author, CreateAuthorData } from '@/types/author';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/error-utils';
import { QueryKeys } from '@/lib/query-key-factory';

export function useWorkspaceAuthors() {
  return useQuery({
    queryKey: QueryKeys.authorKeys().base,
    queryFn: apiGetWorkspaceAuthors,
    retry: false,
  });
}

export function useCreateAuthor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAuthorData) => apiCreateAuthor(data),
    onMutate: async (newAuthor) => {
      await queryClient.cancelQueries({
        queryKey: QueryKeys.authorKeys().base,
      });
      const previous = queryClient.getQueryData<Author[]>(
        QueryKeys.authorKeys().base,
      );
      const optimistic: Author = {
        id: `optimistic-${Date.now()}`,
        ...newAuthor,
      } as Author;
      queryClient.setQueryData(
        QueryKeys.authorKeys().base,
        (old: Author[] | undefined) =>
          old ? [optimistic, ...old] : [optimistic],
      );
      return { previous };
    },
    onSuccess: () => {
      toast.success('Author created');
      queryClient.invalidateQueries({ queryKey: QueryKeys.authorKeys().base });
    },
    onError: (error) => {
      const message = getErrorMessage(error, 'Failed to create author');
      toast.error(message);
      console.error('Error creating author:', error);
      queryClient.invalidateQueries({ queryKey: QueryKeys.authorKeys().base });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.authorKeys().base });
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
    onMutate: async ({ authorId, data }) => {
      await queryClient.cancelQueries({
        queryKey: QueryKeys.authorKeys().base,
      });
      const previous = queryClient.getQueryData<Author[]>(
        QueryKeys.authorKeys().base,
      );
      queryClient.setQueryData(
        QueryKeys.authorKeys().base,
        (old: Author[] | undefined) =>
          (old || []).map((a) =>
            a.id === authorId ? ({ ...a, ...data } as Author) : a,
          ),
      );
      return { previous };
    },
    onSuccess: () => {
      toast.success('Author updated');
      queryClient.invalidateQueries({ queryKey: QueryKeys.authorKeys().base });
    },
    onError: (error) => {
      const message = getErrorMessage(error, 'Failed to update author');
      toast.error(message);
      console.error('Error updating author:', error);
      queryClient.invalidateQueries({ queryKey: QueryKeys.authorKeys().base });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.authorKeys().base });
    },
  });
}

export function useDeleteAuthor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (authorId: string) => {
      if (!import.meta.env.PROD) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        throw new Error('Simulated delete failure');
      }
      return apiDeleteAuthor(authorId);
    },
    onMutate: async (authorId) => {
      await queryClient.cancelQueries({
        queryKey: QueryKeys.authorKeys().base,
      });
      const previous = queryClient.getQueryData<Author[]>(
        QueryKeys.authorKeys().base,
      );
      queryClient.setQueryData(
        QueryKeys.authorKeys().base,
        (old: Author[] | undefined) =>
          (old || []).filter((a) => a.id !== authorId),
      );
      return { previous };
    },
    onSuccess: () => {
      toast.success('Author deleted');
      queryClient.invalidateQueries({ queryKey: QueryKeys.authorKeys().base });
    },
    onError: (error) => {
      const message = getErrorMessage(error, 'Failed to delete author');
      toast.error(message);
      console.error('Error deleting author:', error);
      queryClient.invalidateQueries({ queryKey: QueryKeys.authorKeys().base });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QueryKeys.authorKeys().base });
    },
  });
}
