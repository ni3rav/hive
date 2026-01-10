import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiGeneratePresignedUrl, apiConfirmUpload } from '@/api/media';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/error-utils';
import { QueryKeys } from '@/lib/query-key-factory';

interface UploadData {
  file: File;
  workspaceSlug: string;
  onProgress?: (progress: number, stage: string) => void;
}

export function useMediaUpload(workspaceSlug: string) {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState<
    'idle' | 'generating' | 'uploading' | 'confirming'
  >('idle');

  const mutation = useMutation({
    mutationFn: async ({ file, workspaceSlug, onProgress }: UploadData) => {
      if (!workspaceSlug) {
        throw new Error('Workspace not found');
      }

      if (!file.type.startsWith('image/')) {
        throw new Error('File must be an image');
      }

      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      setUploadStage('generating');
      setProgress(0);
      onProgress?.(0, 'generating');

      const { presignedUrl, key } = await apiGeneratePresignedUrl(
        workspaceSlug,
        {
          filename: file.name,
          contentType: file.type,
          size: file.size,
        },
      );

      setUploadStage('uploading');
      onProgress?.(0, 'uploading');

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 50;
            setProgress(percentComplete);
            onProgress?.(percentComplete, 'uploading');
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'));
        });

        xhr.addEventListener('abort', () => {
          reject(new Error('Upload aborted'));
        });

        xhr.open('PUT', presignedUrl);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
      });

      setUploadStage('confirming');
      setProgress(50);
      onProgress?.(50, 'confirming');

      const media = await apiConfirmUpload(workspaceSlug, {
        key,
        filename: file.name,
        contentType: file.type,
        size: file.size,
      });

      setProgress(100);
      onProgress?.(100, 'complete');

      return media;
    },
    onSuccess: () => {
      toast.success('Image uploaded successfully');
      queryClient.invalidateQueries({
        queryKey: QueryKeys.mediaKeys().list(workspaceSlug),
      });
      setUploadStage('idle');
      setProgress(0);
    },
    onError: (error) => {
      const message = getErrorMessage(error, 'Failed to upload image');
      toast.error(message);
      setUploadStage('idle');
      setProgress(0);
    },
  });

  return {
    uploadImage: (
      file: File,
      onProgress?: (progress: number, stage: string) => void,
    ) => mutation.mutate({ file, workspaceSlug, onProgress }),
    uploadImageAsync: (
      file: File,
      onProgress?: (progress: number, stage: string) => void,
    ) => mutation.mutateAsync({ file, workspaceSlug, onProgress }),
    isPending: mutation.isPending,
    progress,
    uploadStage,
    error: mutation.error,
    reset: () => {
      setProgress(0);
      setUploadStage('idle');
    },
  };
}
