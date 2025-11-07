import { apiCreatePost, apiUpdatePost, apiGetWorkspacePosts } from '@/api/post';
import type { CreatePostData, UpdatePostData, Post } from '@/types/post';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/error-utils';
import { QueryKeys } from '@/lib/query-key-factory';

const postsKey = (workspaceSlug: string) =>
  QueryKeys.postKeys().all(workspaceSlug);

export function useWorkspacePosts(workspaceSlug: string) {
  return useQuery({
    queryKey: postsKey(workspaceSlug),
    queryFn: () => apiGetWorkspacePosts(workspaceSlug),
    retry: false,
    enabled: !!workspaceSlug,
  });
}

export function useCreatePost(workspaceSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePostData) => apiCreatePost(workspaceSlug, data),
    onMutate: async (newPost) => {
      await queryClient.cancelQueries({
        queryKey: postsKey(workspaceSlug),
      });
      const previous = queryClient.getQueryData<Post[]>(
        postsKey(workspaceSlug),
      );
      const optimistic: Post = {
        id: `optimistic-${Date.now()}`,
        workspaceId: '',
        title: newPost.title,
        slug: newPost.slug,
        excerpt: newPost.excerpt,
        status: newPost.status,
        visible: newPost.visible,
        createdAt: new Date(),
        publishedAt: newPost.publishedAt || null,
        updatedAt: new Date(),
        author: null,
        category: null,
        creator: {
          id: '',
          name: '',
          email: '',
        },
        tags: [],
      };
      queryClient.setQueryData(
        postsKey(workspaceSlug),
        (old: Post[] | undefined) =>
          old ? [optimistic, ...old] : [optimistic],
      );
      return { previous };
    },
    onSuccess: () => {
      toast.success('Post created successfully');
      queryClient.invalidateQueries({ queryKey: postsKey(workspaceSlug) });
    },
    onError: (error, _v, ctx) => {
      const message = getErrorMessage(error, 'Failed to create post');
      toast.error(message);
      if (ctx?.previous)
        queryClient.setQueryData(postsKey(workspaceSlug), ctx.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: postsKey(workspaceSlug) });
    },
  });
}

export function useUpdatePost(workspaceSlug: string, postSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdatePostData) =>
      apiUpdatePost(workspaceSlug, postSlug, data),
    onMutate: async (data) => {
      await queryClient.cancelQueries({
        queryKey: postsKey(workspaceSlug),
      });
      const previous = queryClient.getQueryData<Post[]>(
        postsKey(workspaceSlug),
      );
      queryClient.setQueryData(
        postsKey(workspaceSlug),
        (old: Post[] | undefined) =>
          (old || []).map((p) =>
            p.slug === postSlug ? ({ ...p, ...data } as Post) : p,
          ),
      );
      return { previous };
    },
    onSuccess: () => {
      toast.success('Post updated successfully');
      queryClient.invalidateQueries({
        queryKey: postsKey(workspaceSlug),
      });
      queryClient.invalidateQueries({
        queryKey: QueryKeys.postKeys().post(workspaceSlug, postSlug),
      });
    },
    onError: (error, _v, ctx) => {
      const message = getErrorMessage(error, 'Failed to update post');
      toast.error(message);
      if (ctx?.previous)
        queryClient.setQueryData(postsKey(workspaceSlug), ctx.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: postsKey(workspaceSlug),
      });
    },
  });
}
