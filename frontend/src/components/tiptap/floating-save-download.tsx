import React from 'react';
import type { Editor } from '@tiptap/core';
import { Button } from '@/components/ui/button';
import { saveEditorContent } from './persistence';

type Props = {
  editor: Editor | null;
  storageKey?: string;
};

function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export const FloatingSaveDownload: React.FC<Props> = ({
  editor,
  storageKey,
}) => {
  if (!editor) return null;

  const handleSave = () => {
    const json = editor.getJSON();
    saveEditorContent(json, storageKey ?? undefined);
  };

  const handleDownload = () => {
    const html = editor.getHTML();
    const date = new Date().toISOString().replace(/[:.]/g, '-');
    downloadBlob(html, `editor-${date}.html`, 'text/html;charset=utf-8');
  };

  return (
    <div className='mt-2 flex w-full justify-end gap-2 px-3 pb-3'>
      <Button
        onClick={handleSave}
        className='bg-yellow-500 text-black hover:bg-yellow-600'
      >
        Save
      </Button>
      <Button
        onClick={handleDownload}
        variant='outline'
        className='border-yellow-500 text-yellow-700 hover:bg-yellow-50 dark:text-yellow-400 dark:hover:bg-yellow-950/30'
      >
        Download
      </Button>
    </div>
  );
};
