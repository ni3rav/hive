import { useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImagePreviewProps {
    src: string;
    alt: string;
    className?: string;
}

export function ImagePreview({ src, alt, className }: ImagePreviewProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Thumbnail */}
            <div
                className={cn(
                    'cursor-pointer overflow-hidden rounded-lg transition-all hover:opacity-90',
                    className
                )}
                onClick={() => setIsOpen(true)}
            >
                <img
                    src={src}
                    alt={alt}
                    className='w-full h-full object-cover'
                />
            </div>

            {/* Lightbox */}
            {isOpen && (
                <div
                    className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in-0'
                    onClick={() => setIsOpen(false)}
                >
                    <button
                        className='absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors'
                        onClick={() => setIsOpen(false)}
                    >
                        <X className='w-6 h-6 text-white' />
                    </button>
                    <div
                        className='max-w-5xl max-h-[90vh] p-4'
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={src}
                            alt={alt}
                            className='max-w-full max-h-[85vh] object-contain rounded-lg'
                        />
                    </div>
                </div>
            )}
        </>
    );
}
