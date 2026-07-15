export interface Media {
  id: string;
  workspaceId: string;
  uploadedBy: string;
  filename: string;
  contentType: string;
  size: number;
  r2Key: string;
  publicUrl: string;
  thumbhashBase64?: string | null;
  aspectRatio?: number | null;
  createdAt: string;
}

export interface GeneratePresignedUrlRequest {
  filename: string;
  contentType: string;
  size: number;
}

export interface GeneratePresignedUrlResponse {
  presignedUrl: string;
  key: string;
  expiresIn: number;
}

export interface ConfirmUploadRequest {
  key: string;
  filename: string;
  contentType: string;
  size: number;
}
