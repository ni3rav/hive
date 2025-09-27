import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { MetadataForm } from './metadata-form';
import { RichTextEditorDemo } from './rich-text-editor';
import { type PostMetadata } from '@/types/editor';

const initialMetadata: PostMetadata = {
  title: '',
  slug: '',
  authors: [],
  publishedAt: new Date(),
  excerpt: '',
  category: [],
  tags: [],
};

export function PostEditorPage({ className = '' }: { className?: string }) {
  const [metadata, setMetadata] = useState<PostMetadata>(initialMetadata);
  const [isMetadataExpanded, setIsMetadataExpanded] = useState(true);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const newTitle = e.target.value;
  const baseSlug = newTitle
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     
    .replace(/[^\w-]+/g, ''); 

  let newSlug = '';
  if (baseSlug) {
    const randomChars = Math.random().toString(36).substring(2, 8);
    newSlug = `${baseSlug}-${randomChars}`;
  }

  setMetadata(prev => ({ ...prev, title: newTitle, slug: newSlug }));
};

  return (
    <div className={cn('h-full min-h-0 flex flex-col', className)}>
      {/* Optional metadata/header row; keep it non-growing */}
      <div className="border-b border-border/40">
        <MetadataForm
          isExpanded={isMetadataExpanded}
          setIsExpanded={setIsMetadataExpanded}
          metadata={metadata}
          setMetadata={setMetadata}
          onTitleChange={handleTitleChange}
        />
      </div>
      {/* Editor must be the only grow item */}
      <div className="flex-1 min-h-0">
      <div
        className="flex-grow w-full h-full"
        onFocusCapture={() => setIsMetadataExpanded(false)}
      >
        <RichTextEditorDemo className="h-full" />
      </div>
    </div>
    </div>
  );
}