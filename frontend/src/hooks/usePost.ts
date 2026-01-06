import {
  apiCreatePost,
  apiUpdatePost,
  apiGetWorkspacePosts,
  apiGetPost,
  apiDeletePost,
} from '@/api/post';
import type { CreatePostData, UpdatePostData, Post } from '@/types/post';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/error-utils';
import { QueryKeys } from '@/lib/query-key-factory';
import type {
  DashboardStatsPayload,
  DashboardHeatmapPayload,
} from '@/types/dashboard';
import { useNavigate } from 'react-router-dom';

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

export function usePost(workspaceSlug: string, postSlug: string) {
  return useQuery({
    queryKey: QueryKeys.postKeys().post(workspaceSlug, postSlug),
    queryFn: () => apiGetPost(workspaceSlug, postSlug),
    retry: false,
    enabled: !!workspaceSlug && !!postSlug,
  });
}

export function useCreatePost(workspaceSlug: string) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (data: CreatePostData) => apiCreatePost(workspaceSlug, data),
    onMutate: async (newPost) => {
      await queryClient.cancelQueries({
        queryKey: postsKey(workspaceSlug),
      });
      const previous = queryClient.getQueryData<Post[]>(
        postsKey(workspaceSlug),
      );
      const now = new Date().toISOString();
      const optimistic: Post = {
        id: `optimistic-${Date.now()}`,
        workspaceId: '',
        title: newPost.title,
        slug: newPost.slug,
        excerpt: newPost.excerpt,
        status: newPost.status,
        visible: newPost.visible,
        createdAt: now,
        publishedAt: newPost.publishedAt
          ? newPost.publishedAt.toISOString()
          : null,
        updatedAt: now,
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
    onSuccess: (data) => {
      toast.success('Post created successfully');

      const statsKey = QueryKeys.workspaceKeys().dashboardStats(workspaceSlug);
      queryClient.setQueryData<DashboardStatsPayload>(statsKey, (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          stats: oldData.stats.map((stat) =>
            stat.label.toLowerCase() === 'posts'
              ? { ...stat, value: stat.value + 1 }
              : stat,
          ),
          recentPosts: [
            {
              id: data.id,
              title: data.title,
              status: data.status,
              publishedAt: data.publishedAt
                ? new Date(data.publishedAt).toLocaleDateString()
                : '',
              excerpt: data.excerpt || '',
            },
            ...oldData.recentPosts.slice(0, 4),
          ],
        };
      });

      const heatmapKey =
        QueryKeys.workspaceKeys().dashboardHeatmap(workspaceSlug);
      const today = new Date().toISOString().split('T')[0];
      queryClient.setQueryData<DashboardHeatmapPayload>(
        heatmapKey,
        (oldData) => {
          if (!oldData) return oldData;
          const existingPointIndex = oldData.heatmap.findIndex(
            (point) => point.day === today,
          );
          if (existingPointIndex >= 0) {
            return {
              ...oldData,
              heatmap: oldData.heatmap.map((point) =>
                point.day === today
                  ? {
                    ...point,
                    posts: point.posts + 1,
                    activity: point.activity + 1,
                  }
                  : point,
              ),
            };
          } else {
            return {
              ...oldData,
              heatmap: [
                ...oldData.heatmap,
                {
                  day: today,
                  activity: 1,
                  posts: 1,
                  authors: 0,
                  categories: 0,
                  tags: 0,
                },
              ],
            };
          }
        },
      );

      // Navigate to the newly created post's edit page (replace to stay on same editor)
      navigate(`/dashboard/${workspaceSlug}/editor/${data.slug}`, { replace: true });
    },
    onError: (error, _v, ctx) => {
      const message = getErrorMessage(error, 'Failed to create post');
      toast.error(message);
      if (ctx?.previous)
        queryClient.setQueryData(postsKey(workspaceSlug), ctx.previous);
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
        queryKey: QueryKeys.postKeys().post(workspaceSlug, postSlug),
      });
    },
    onError: (error, _v, ctx) => {
      const message = getErrorMessage(error, 'Failed to update post');
      toast.error(message);
      if (ctx?.previous)
        queryClient.setQueryData(postsKey(workspaceSlug), ctx.previous);
    },
  });
}

export function useDeletePost(workspaceSlug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postSlug: string) => apiDeletePost(workspaceSlug, postSlug),
    onMutate: async (postSlug) => {
      await queryClient.cancelQueries({
        queryKey: postsKey(workspaceSlug),
      });
      const previous = queryClient.getQueryData<Post[]>(
        postsKey(workspaceSlug),
      );
      queryClient.setQueryData(
        postsKey(workspaceSlug),
        (old: Post[] | undefined) =>
          (old || []).filter((p) => p.slug !== postSlug),
      );
      return { previous };
    },
    onSuccess: () => {
      toast.success('Post deleted successfully');

      const statsKey = QueryKeys.workspaceKeys().dashboardStats(workspaceSlug);
      queryClient.setQueryData<DashboardStatsPayload>(statsKey, (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          stats: oldData.stats.map((stat) =>
            stat.label.toLowerCase() === 'posts' && stat.value > 0
              ? { ...stat, value: stat.value - 1 }
              : stat,
          ),
        };
      });

      const heatmapKey =
        QueryKeys.workspaceKeys().dashboardHeatmap(workspaceSlug);
      const today = new Date().toISOString().split('T')[0];
      queryClient.setQueryData<DashboardHeatmapPayload>(
        heatmapKey,
        (oldData) => {
          if (!oldData) return oldData;
          const existingPointIndex = oldData.heatmap.findIndex(
            (point) => point.day === today,
          );
          if (existingPointIndex >= 0) {
            return {
              ...oldData,
              heatmap: oldData.heatmap.map((point) =>
                point.day === today
                  ? {
                    ...point,
                    posts: Math.max(0, point.posts - 1),
                    activity: Math.max(0, point.activity - 1),
                  }
                  : point,
              ),
            };
          }
          return oldData;
        },
      );
    },
    onError: (error, _v, ctx) => {
      const message = getErrorMessage(error, 'Failed to delete post');
      toast.error(message);
      if (ctx?.previous)
        queryClient.setQueryData(postsKey(workspaceSlug), ctx.previous);
    },
  });
}
