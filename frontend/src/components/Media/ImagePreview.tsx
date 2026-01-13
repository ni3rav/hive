import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { thumbHashToDataURL } from 'thumbhash';

interface ImagePreviewProps {
  src: string;
  alt: string;
  className?: string;
  filename?: string;
  thumbhashBase64?: string | null;
  aspectRatio?: number | null;
}

export function ImagePreview({
  src,
  alt,
  className,
  filename,
  thumbhashBase64,
  aspectRatio,
}: ImagePreviewProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [placeholderUrl, setPlaceholderUrl] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (thumbhashBase64 && !imageLoaded) {
      try {
        const thumbhashBytes = Uint8Array.from(atob(thumbhashBase64), (c) =>
          c.charCodeAt(0),
        );
        const dataUrl = thumbHashToDataURL(thumbhashBytes);
        setPlaceholderUrl(dataUrl);
      } catch {
        setPlaceholderUrl(null);
      }
    }
  }, [thumbhashBase64, imageLoaded]);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const containerStyle =
    aspectRatio && !imageLoaded
      ? { aspectRatio: aspectRatio.toString() }
      : undefined;

  return (
    <>
      <div
        className={cn(
          'cursor-pointer overflow-hidden rounded-lg transition-all hover:opacity-90 relative',
          className,
        )}
        style={containerStyle}
        onClick={() => setIsOpen(true)}
      >
        {placeholderUrl && !imageLoaded && (
          <img
            src={placeholderUrl}
            alt={alt}
            className='absolute inset-0 w-full h-full object-cover'
            aria-hidden='true'
          />
        )}
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className={cn(
            'w-full h-full object-cover transition-opacity duration-300',
            imageLoaded ? 'opacity-100' : 'opacity-0',
          )}
          onLoad={handleImageLoad}
        />
      </div>

      {isOpen && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm animate-in fade-in-0'
          onClick={() => setIsOpen(false)}
        >
          <button
            className='absolute top-4 right-4 p-2 rounded-full bg-accent/10 hover:bg-accent/20 transition-colors text-foreground'
            onClick={() => setIsOpen(false)}
          >
            <X className='w-6 h-6' />
          </button>
          <div
            className='max-w-5xl max-h-[90vh] p-4 flex flex-col items-center gap-4'
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={src}
              alt={alt}
              className='max-w-full max-h-[80vh] object-contain rounded-lg'
            />
            {filename && (
              <p className='text-foreground text-sm font-medium bg-muted/90 px-4 py-2 rounded-lg max-w-full break-all'>
                {filename}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
