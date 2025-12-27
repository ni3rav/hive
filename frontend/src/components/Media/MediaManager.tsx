import { useState, useEffect } from 'react';
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
import { Plus, Image as ImageIcon, Trash2 } from 'lucide-react';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { useWorkspaceSlug } from '@/hooks/useWorkspaceSlug';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ImagePreview } from './ImagePreview';

interface MediaItem {
  id: string;
  url: string;
  filename: string;
  size: number;
  uploadedAt: Date;
}

function MediaItemCard({
  media,
  onDelete,
  formatFileSize,
}: {
  media: MediaItem;
  onDelete: (m: MediaItem) => void;
  formatFileSize: (bytes: number) => string;
}) {
  return (
    <div className='group relative border border-foreground/5 rounded-lg overflow-hidden'>
      <Button
        size='icon'
        variant='destructive'
        aria-label='Delete image'
        className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10'
        onClick={() => onDelete(media)}
      >
        <Trash2 className='w-4 h-4' />
      </Button>

      <ImagePreview
        src={media.url}
        alt={media.filename}
        className='aspect-square bg-muted'
      />
      <div className='p-3 space-y-2'>
        <p className='text-sm font-medium truncate' title={media.filename}>
          {media.filename}
        </p>
        <p className='text-xs text-muted-foreground'>
          {formatFileSize(media.size)}
        </p>
      </div>
    </div>
  );
}

export default function MediaManager() {
  const workspaceSlug = useWorkspaceSlug();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);

  // Placeholder states - will be replaced with actual API hooks
  const isLoading = false;
  const isError = false;

  // Sync mediaItems to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('hive_media_items', JSON.stringify(mediaItems));
    } catch (e) {
      console.error('Failed to save media items', e);
    }
  }, [mediaItems]);

  const handleUploadMedia = () => {
    // Trigger file input click
    document.getElementById('media-file-input')?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return;
      }

      // Convert to base64 for preview (in production, upload to server)
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        const newMedia: MediaItem = {
          id: Math.random().toString(36).substring(7),
          url: base64,
          filename: file.name,
          size: file.size,
          uploadedAt: new Date(),
        };
        setMediaItems((prev) => [newMedia, ...prev]);
        toast.success(`${file.name} uploaded successfully`);
      };
      reader.onerror = () => {
        toast.error(`Failed to upload ${file.name}`);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    e.target.value = '';
  };

  const handleDeleteClick = (media: MediaItem) => {
    setSelectedMedia(media);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (selectedMedia) {
      setMediaItems((prev) =>
        prev.filter((item) => item.id !== selectedMedia.id),
      );
      toast.success('Image deleted successfully');
    }
    setIsDeleteOpen(false);
    setSelectedMedia(null);
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
                <Button onClick={handleUploadMedia} size='sm'>
                  <Plus />
                  Upload Media
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {mediaItems.length === 0 ? (
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
                  <Button onClick={handleUploadMedia} size='sm'>
                    <Plus />
                    Upload Media
                  </Button>
                </EmptyContent>
              </Empty>
            ) : (
              <ScrollArea className='h-[calc(100vh-16rem)] [&_[data-slot=scroll-area-thumb]]:bg-primary/15'>
                <div className='grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 p-1'>
                  {mediaItems.map((media) => (
                    <MediaItemCard
                      key={media.id}
                      media={media}
                      onDelete={handleDeleteClick}
                      formatFileSize={formatFileSize}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Hidden file input */}
      <input
        id='media-file-input'
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
    </>
  );
}
