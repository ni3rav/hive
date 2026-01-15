import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Plus,
  Image as ImageIcon,
  Trash2,
  Loader2,
  Expand,
} from 'lucide-react';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { useWorkspaceSlug } from '@/hooks/useWorkspaceSlug';
import { useMedia, useDeleteMedia } from '@/hooks/useMedia';
import { useMediaUpload } from '@/hooks/useMediaUpload';
import { useWorkspaceVerification } from '@/hooks/useWorkspace';
import { useAuth } from '@/hooks/useAuth';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ImagePreview } from './ImagePreview';
import type { Media } from '@/types/media';
import type { MemberRole } from '@/types/member';

function MediaItemCard({
  media,
  onDelete,
  onPreview,
  formatFileSize,
  canDelete,
}: {
  media: Media;
  onDelete: (m: Media) => void;
  onPreview: (m: Media) => void;
  formatFileSize: (bytes: number) => string;
  canDelete: boolean;
}) {
  return (
    <div className='group relative border border-foreground/5 rounded-lg overflow-hidden break-inside-avoid mb-3'>
      <div className='absolute inset-0 z-[5] bg-background/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out pointer-events-none' />

      <div className='absolute top-0 right-0 z-10 p-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out translate-y-1 group-hover:translate-y-0'>
        <Button
          size='icon'
          variant='secondary'
          aria-label='Preview image'
          className='h-7 w-7 transition-transform duration-200 hover:scale-105'
          onClick={() => onPreview(media)}
        >
          <Expand className='w-3.5 h-3.5' />
        </Button>
        {canDelete && (
          <Button
            size='icon'
            variant='destructive'
            aria-label='Delete image'
            className='h-7 w-7 transition-transform duration-200 hover:scale-105'
            onClick={() => onDelete(media)}
          >
            <Trash2 className='w-3.5 h-3.5' />
          </Button>
        )}
      </div>

      <div className='absolute bottom-0 left-0 right-0 z-10 p-3 pb-4 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out translate-y-1 group-hover:translate-y-0'>
        <p
          className='text-sm font-medium truncate text-foreground'
          title={media.filename}
        >
          {media.filename}
        </p>
        <p className='text-xs text-muted-foreground mt-0.5'>
          {formatFileSize(media.size)}
        </p>
      </div>

      <ImagePreview
        src={media.publicUrl}
        alt={media.filename}
        className='bg-muted'
        filename={media.filename}
        thumbhashBase64={media.thumbhashBase64}
        aspectRatio={media.aspectRatio}
      />
    </div>
  );
}

export default function MediaManager() {
  const workspaceSlug = useWorkspaceSlug();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [previewMedia, setPreviewMedia] = useState<Media | null>(null);

  const { data: user } = useAuth();
  const { data: workspace } = useWorkspaceVerification(workspaceSlug);
  const userRole = (workspace?.role || 'member') as MemberRole;

  const {
    data: mediaItems = [],
    isLoading,
    isError,
  } = useMedia(workspaceSlug || '');
  const deleteMedia = useDeleteMedia(workspaceSlug || '');
  const {
    uploadImage,
    isPending: isUploading,
    progress,
    uploadStage,
  } = useMediaUpload(workspaceSlug || '');

  const canDeleteMedia = (media: Media) => {
    if (userRole === 'admin' || userRole === 'owner') {
      return true;
    }
    return media.uploadedBy === user?.id;
  };

  const handleUploadMedia = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !workspaceSlug) return;

    const file = files[0];
    uploadImage(file);
    e.target.value = '';
  };

  const handleDeleteClick = (media: Media) => {
    setSelectedMedia(media);
    setIsDeleteOpen(true);
  };

  const handlePreviewClick = (media: Media) => {
    setPreviewMedia(media);
  };

  const confirmDelete = () => {
    if (selectedMedia && workspaceSlug) {
      deleteMedia.mutate(selectedMedia.id);
      setIsDeleteOpen(false);
      setSelectedMedia(null);
    }
  };

  const cancelDelete = () => {
    setIsDeleteOpen(false);
    setSelectedMedia(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (isLoading || !workspaceSlug) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className='h-6 w-40' />
            </CardTitle>
            <CardDescription>
              <Skeleton className='h-4 w-64' />
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <Skeleton className='h-10 w-full' />
            <div className='space-y-3'>
              <Skeleton className='h-14 w-full' />
              <Skeleton className='h-14 w-full' />
              <Skeleton className='h-14 w-full' />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError) {
    return (
      <div className='p-6'>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Media</CardTitle>
              <CardDescription>Manage your media files</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Empty className='border-dashed'>
              <EmptyHeader>
                <EmptyMedia variant='icon'>
                  <ImageIcon />
                </EmptyMedia>
                <EmptyTitle>Error loading media</EmptyTitle>
                <EmptyDescription>
                  There was an error loading your media files. Please try again.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className='p-6'>
        <Card className='animate-in fade-in-50 zoom-in-95 duration-300'>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle>Media</CardTitle>
                <CardDescription>Manage your media files</CardDescription>
              </div>
              {mediaItems.length > 0 && (
                <Button
                  onClick={handleUploadMedia}
                  size='sm'
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                      Uploading
                    </>
                  ) : (
                    <>
                      <Plus />
                      Upload Media
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isUploading && (
              <div className='mb-4 space-y-2'>
                <div className='flex items-center justify-between text-sm'>
                  <span>
                    {uploadStage === 'generating' && 'Generating upload URL...'}
                    {uploadStage === 'uploading' && 'Uploading to cloud...'}
                    {uploadStage === 'confirming' && 'Saving...'}
                  </span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className='h-2 w-full bg-muted rounded-full overflow-hidden'>
                  <div
                    className='h-full bg-primary transition-all duration-300'
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
            {mediaItems.length === 0 && !isLoading ? (
              <Empty className='border-dashed animate-in fade-in-50'>
                <EmptyHeader>
                  <EmptyMedia variant='icon'>
                    <ImageIcon />
                  </EmptyMedia>
                  <EmptyTitle>No Media Yet</EmptyTitle>
                  <EmptyDescription>
                    You haven't uploaded any media files yet. Get started by
                    uploading your first file.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button
                    onClick={handleUploadMedia}
                    size='sm'
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                        Uploading
                      </>
                    ) : (
                      <>
                        <Plus />
                        Upload Media
                      </>
                    )}
                  </Button>
                </EmptyContent>
              </Empty>
            ) : (
              <ScrollArea className='h-[calc(100vh-16rem)] [&_[data-slot=scroll-area-thumb]]:bg-primary/15'>
                <div className='columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-3 p-1 [column-width:180px]'>
                  {mediaItems.map((media) => (
                    <MediaItemCard
                      key={media.id}
                      media={media}
                      onDelete={handleDeleteClick}
                      onPreview={handlePreviewClick}
                      formatFileSize={formatFileSize}
                      canDelete={canDeleteMedia(media)}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      <input
        ref={fileInputRef}
        type='file'
        accept='image/*'
        className='hidden'
        onChange={handleFileChange}
      />

      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete media</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the
              media file.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={cancelDelete}>
              Cancel
            </Button>
            <Button variant='destructive' onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {previewMedia && (
        <ImagePreview
          src={previewMedia.publicUrl}
          alt={previewMedia.filename}
          filename={previewMedia.filename}
          thumbhashBase64={previewMedia.thumbhashBase64}
          aspectRatio={previewMedia.aspectRatio}
          isOpen={true}
          onOpenChange={(open) => !open && setPreviewMedia(null)}
        />
      )}
    </>
  );
}
