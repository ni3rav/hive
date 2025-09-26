import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea'; 
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { type PostMetadata } from '@/types/editor';

interface MetadataFormProps {
  isExpanded: boolean;
  setIsExpanded: (isExpanded: boolean) => void;
  metadata: PostMetadata;
  setMetadata: React.Dispatch<React.SetStateAction<PostMetadata>>;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function MetadataForm({
  isExpanded,
  setIsExpanded,
  metadata,
  setMetadata,
  onTitleChange,
}: MetadataFormProps) {

  // The minimized view when writing
  if (!isExpanded) {
    return (
      <div
        className="flex items-center justify-between p-3 border-b bg-card cursor-pointer hover:bg-muted/50"
        onClick={() => setIsExpanded(true)}
      >
        <div className="flex items-center gap-4 text-sm">
          <span className="font-medium">Published:</span>
          <span className="text-muted-foreground">{format(metadata.publishedAt, 'PPP')}</span>
          <span className="font-medium ml-4">Category:</span>
          <span className="text-muted-foreground">{metadata.category || 'None'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Settings className="h-4 w-4" />
          <span>Edit Metadata</span>
        </div>
      </div>
    );
  }

  // The full, expanded form for editing metadata
  return (
    <div className="p-8 border-b space-y-6 bg-card">
      <Input
        placeholder="A great title"
        className="text-4xl font-bold h-auto p-0 border-none focus-visible:ring-0 shadow-none !outline-none"
        value={metadata.title}
        onChange={onTitleChange}
      />
      
      {/* This is the table-like structure for other fields */}
      <div className="grid grid-cols-[100px_1fr] items-center gap-x-8 gap-y-4 text-sm">
        <label className="text-muted-foreground">Slug</label>
        <Input 
          className="h-8" 
          value={metadata.slug}
          onChange={(e) => setMetadata(prev => ({ ...prev, slug: e.target.value }))}
        />

        <label className="text-muted-foreground">Authors</label>
        {/* NOTE: You would replace this with a multi-select component */}
        <Input className="h-8" placeholder="Select authors" />

        <label className="text-muted-foreground">Published at</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn('w-[240px] justify-start text-left font-normal h-8 px-2', !metadata.publishedAt && 'text-muted-foreground')}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {metadata.publishedAt ? format(metadata.publishedAt, 'PPP') : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={metadata.publishedAt}
              onSelect={(date) => setMetadata(prev => ({...prev, publishedAt: date || new Date()}))}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <label className="text-muted-foreground self-start">Excerpt</label>
        <Textarea
          placeholder="A short description of your post. Recommended to be 155 characters or less."
          value={metadata.excerpt}
          onChange={(e) => setMetadata(prev => ({ ...prev, excerpt: e.target.value }))}
        />

        <label className="text-muted-foreground">Category</label>
        {/* NOTE: replace this with a Select or ComboBox component */}
        <Input className="h-8" placeholder="Select a category" />

        <label className="text-muted-foreground">Tags</label>
        {/* NOTE: replace this with a multi-select component */}
        <Input className="h-8" placeholder="Select some tags" />
      </div>
    </div>
  );
}