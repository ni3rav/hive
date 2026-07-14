import { NodeViewWrapper } from '@tiptap/react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { thumbHashToDataURL } from 'thumbhash';
import { useWorkspaceSlug } from '@/hooks/useWorkspaceSlug';
import { useMedia } from '@/hooks/useMedia';
import type { NodeViewProps } from '@tiptap/react';

export function ImageNodeView({ node }: NodeViewProps) {
  const src = node.attrs.src;
  const mediaId = node.attrs['data-media-id'];
  const workspaceSlug = useWorkspaceSlug();

  const [imageLoaded, setImageLoaded] = useState(false);
  const [placeholderUrl, setPlaceholderUrl] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);

  const { data: mediaItems = [] } = useMedia(workspaceSlug || '');

  useEffect(() => {
    if (!mediaId || !mediaItems.length) return;

    const media = mediaItems.find((m) => m.id === mediaId);
    if (!media) return;

    if (media.aspectRatio) {
      setAspectRatio(media.aspectRatio);
    }

    if (media.thumbhashBase64 && !imageLoaded) {
      try {
        const thumbhashBytes = Uint8Array.from(
          atob(media.thumbhashBase64),
          (c) => c.charCodeAt(0),
        );
        const dataUrl = thumbHashToDataURL(thumbhashBytes);
        setPlaceholderUrl(dataUrl);
      } catch {
        setPlaceholderUrl(null);
      }
    }
  }, [mediaId, mediaItems, imageLoaded]);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const containerStyle = aspectRatio
    ? { aspectRatio: aspectRatio.toString() }
    : undefined;

  return (
    <NodeViewWrapper className='tiptap-image-wrapper'>
      <div
        className='relative overflow-hidden rounded-lg'
        style={containerStyle}
      >
        {placeholderUrl && !imageLoaded && (
          <img
            src={placeholderUrl}
            alt=''
            className='absolute inset-0 w-full h-full object-cover'
            aria-hidden='true'
          />
        )}
        <img
          src={src}
          alt=''
          className={cn(
            'tiptap-image w-full h-full object-cover transition-opacity duration-300',
            imageLoaded ? 'opacity-100' : 'opacity-0',
          )}
          onLoad={handleImageLoad}
        />
      </div>
    </NodeViewWrapper>
  );
}
