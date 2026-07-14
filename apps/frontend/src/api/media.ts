import { apiGet, apiPost, apiDelete } from '@/lib/api-client';
import type {
  Media,
  GeneratePresignedUrlRequest,
  GeneratePresignedUrlResponse,
  ConfirmUploadRequest,
} from '@/types/media';

export async function apiGeneratePresignedUrl(
  workspaceSlug: string,
  data: GeneratePresignedUrlRequest,
): Promise<GeneratePresignedUrlResponse> {
  return apiPost<GeneratePresignedUrlResponse, GeneratePresignedUrlRequest>(
    `/api/media/${workspaceSlug}/presigned-url`,
    data,
  );
}

export async function apiConfirmUpload(
  workspaceSlug: string,
  data: ConfirmUploadRequest,
): Promise<Media> {
  return apiPost<Media, ConfirmUploadRequest>(
    `/api/media/${workspaceSlug}/confirm`,
    data,
  );
}

export async function apiListMedia(workspaceSlug: string): Promise<Media[]> {
  return apiGet<Media[]>(`/api/media/${workspaceSlug}`);
}

export async function apiDeleteMedia(
  workspaceSlug: string,
  mediaId: string,
): Promise<void> {
  return apiDelete<void>(`/api/media/${workspaceSlug}/${mediaId}`);
}

