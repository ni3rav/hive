import { apiGet, apiPatch, apiPost, apiDelete } from '@/lib/api-client';
import type { Post, CreatePostData, UpdatePostData } from '@/types/post';
import type { ProseMirrorJSON } from '@/components/editor/persistence';

export async function apiGetWorkspacePosts(
  workspaceSlug: string,
): Promise<Post[]> {
  return apiGet<Post[]>(`/api/post/${workspaceSlug}`);
}

export async function apiGetPost(
  workspaceSlug: string,
  postSlug: string,
): Promise<
  Post & { content: { id: string; contentHtml: string; contentJson: ProseMirrorJSON } }
> {
  return apiGet<
    Post & {
      content: { id: string; contentHtml: string; contentJson: ProseMirrorJSON };
    }
  >(`/api/post/${workspaceSlug}/${postSlug}`);
}

export async function apiCreatePost(
  workspaceSlug: string,
  data: CreatePostData,
): Promise<Post> {
  return apiPost<Post, CreatePostData>(`/api/post/${workspaceSlug}`, data);
}

export async function apiUpdatePost(
  workspaceSlug: string,
  postSlug: string,
  data: UpdatePostData,
): Promise<Post> {
  return apiPatch<Post, UpdatePostData>(
    `/api/post/${workspaceSlug}/${postSlug}`,
    data,
  );
}

export async function apiDeletePost(
  workspaceSlug: string,
  postSlug: string,
): Promise<void> {
  return apiDelete<void>(`/api/post/${workspaceSlug}/${postSlug}`);
}
