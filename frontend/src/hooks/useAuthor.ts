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

const authorsKey = (workspaceSlug: string) =>
  [...QueryKeys.authorKeys().base, workspaceSlug] as const;

export function useWorkspaceAuthors(workspaceSlug: string) {
  return useQuery({
    queryKey: authorsKey(workspaceSlug),
    queryFn: () => apiGetWorkspaceAuthors(workspaceSlug),
    retry: false,
  });
}

export function useCreateAuthor(workspaceSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAuthorData) =>
      apiCreateAuthor(workspaceSlug, data),
    onMutate: async (newAuthor) => {
      await queryClient.cancelQueries({
        queryKey: authorsKey(workspaceSlug),
      });
      const previous = queryClient.getQueryData<Author[]>(
        authorsKey(workspaceSlug),
      );
      const optimistic: Author = {
        id: `optimistic-${Date.now()}`,
        ...newAuthor,
      } as Author;
      queryClient.setQueryData(
        authorsKey(workspaceSlug),
        (old: Author[] | undefined) =>
          old ? [optimistic, ...old] : [optimistic],
      );
      return { previous };
    },
    onSuccess: () => {
      toast.success('Author created');
      queryClient.invalidateQueries({ queryKey: authorsKey(workspaceSlug) });
    },
    onError: (error, _v, ctx) => {
      const message = getErrorMessage(error, 'Failed to create author');
      toast.error(message);
      if (ctx?.previous)
        queryClient.setQueryData(authorsKey(workspaceSlug), ctx.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: authorsKey(workspaceSlug) });
    },
  });
}

export function useUpdateAuthor(workspaceSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      authorId,
      data,
    }: {
      authorId: string;
      data: Partial<CreateAuthorData>;
    }) => apiUpdateAuthor(workspaceSlug, authorId, data),
    onMutate: async ({ authorId, data }) => {
      await queryClient.cancelQueries({
        queryKey: authorsKey(workspaceSlug),
      });
      const previous = queryClient.getQueryData<Author[]>(
        authorsKey(workspaceSlug),
      );
      queryClient.setQueryData(
        authorsKey(workspaceSlug),
        (old: Author[] | undefined) =>
          (old || []).map((a) =>
            a.id === authorId ? ({ ...a, ...data } as Author) : a,
          ),
      );
      return { previous };
    },
    onSuccess: () => {
      toast.success('Author updated');
      queryClient.invalidateQueries({ queryKey: authorsKey(workspaceSlug) });
    },
    onError: (error, _v, ctx) => {
      const message = getErrorMessage(error, 'Failed to update author');
      toast.error(message);
      if (ctx?.previous)
        queryClient.setQueryData(authorsKey(workspaceSlug), ctx.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: authorsKey(workspaceSlug) });
    },
  });
}

export function useDeleteAuthor(workspaceSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (authorId: string) => apiDeleteAuthor(workspaceSlug, authorId),

    onMutate: async (authorId) => {
      await queryClient.cancelQueries({ queryKey: authorsKey(workspaceSlug) });
      const previous = queryClient.getQueryData<Author[]>(
        authorsKey(workspaceSlug),
      );
      queryClient.setQueryData(
        authorsKey(workspaceSlug),
        (old: Author[] | undefined) =>
          (old || []).filter((a) => a.id !== authorId),
      );
      return { previous };
    },
    onSuccess: () => {
      toast.success('Author deleted');
    },
    onError: (error, _authorId, ctx) => {
      const message = getErrorMessage(error, 'Failed to delete author');
      toast.error(message);
      if (ctx?.previous) {
        queryClient.setQueryData(authorsKey(workspaceSlug), ctx.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: authorsKey(workspaceSlug) });
    },
  });
}
