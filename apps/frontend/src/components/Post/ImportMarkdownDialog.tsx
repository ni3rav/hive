import { useCallback, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImportMarkdownDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFileReady: (raw: string) => void;
}

export function ImportMarkdownDialog({
  open,
  onOpenChange,
  onFileReady,
}: ImportMarkdownDialogProps) {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    (file: File) => {
      if (!file.name.toLowerCase().endsWith('.md')) {
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const raw = String(reader.result ?? '');
        if (raw.trim()) {
          onFileReady(raw);
          onOpenChange(false);
        }
      };
      reader.readAsText(file);
    },
    [onFileReady, onOpenChange],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      e.target.value = '';
    },
    [processFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDraggingOver(false);
      const file = e.dataTransfer?.files?.[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const hasFile = e.dataTransfer?.types?.includes('Files');
    if (hasFile) setIsDraggingOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const related = e.relatedTarget as Node | null;
    if (!related || !e.currentTarget.contains(related)) {
      setIsDraggingOver(false);
    }
  }, []);

  const handleUploadClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import markdown</DialogTitle>
          <DialogDescription>
            Upload a .md file or drag and drop it here to create a new post from
            markdown.
          </DialogDescription>
        </DialogHeader>
        <input
          ref={inputRef}
          type='file'
          accept='.md'
          className='hidden'
          onChange={handleFileChange}
        />
        <div
          className={cn(
            'flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-8 transition-colors min-h-[12rem]',
            isDraggingOver
              ? 'border-primary bg-primary/10'
              : 'border-muted-foreground/30 hover:border-muted-foreground/50',
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className='rounded-full bg-muted p-3'>
            <FileDown className='h-8 w-8 text-muted-foreground' strokeWidth={2} />
          </div>
          <div className='flex flex-col items-center gap-2 text-center'>
            <p className='text-sm font-medium text-foreground'>
              {isDraggingOver ? 'Drop your file here' : 'Drag and drop a .md file'}
            </p>
            <p className='text-xs text-muted-foreground'>or</p>
            <Button variant='outline' size='sm' onClick={handleUploadClick}>
              Browse to upload
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
