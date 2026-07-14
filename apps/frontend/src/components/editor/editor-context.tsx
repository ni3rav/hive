import * as React from 'react';
import type { PostMetadata } from '@/types/editor';
import type { TiptapHandle } from '@/components/editor/Tiptap';

export type EditorContextValue = {
  isExpanded: boolean;
  setIsExpanded: (value: boolean) => void;
  metadata: PostMetadata;
  setMetadata: React.Dispatch<React.SetStateAction<PostMetadata>>;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  editorRef: React.RefObject<TiptapHandle>;
  workspaceSlug: string;
  postSlug?: string;
  isEditing: boolean;
  originalPublishedAt?: Date;
  originalSlug?: string;
  originalMetadata: PostMetadata | null;
  setOriginalMetadata: React.Dispatch<
    React.SetStateAction<PostMetadata | null>
  >;
  originalContent: string | null;
  setOriginalContent: React.Dispatch<React.SetStateAction<string | null>>;
  shouldSkipBlocker: { current: boolean };
};

const EditorContext = React.createContext<EditorContextValue | null>(null);

export function EditorProvider({
  value,
  children,
}: {
  value: EditorContextValue;
  children: React.ReactNode;
}) {
  return (
    <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useEditorContext(): EditorContextValue {
  const ctx = React.useContext(EditorContext);
  if (!ctx) {
    throw new Error('useEditorContext must be used within an EditorProvider');
  }
  return ctx;
}
