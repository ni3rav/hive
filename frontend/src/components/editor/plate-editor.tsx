import { Plate, usePlateEditor } from 'platejs/react';
import type { Value } from 'platejs';

import { EditorKit } from '@/components/editor/editor-kit';
import { Editor, EditorContainer } from '@/components/editor/editor';
import { loadContent, saveContent } from '@/components/editor/persistence';
import { useWorkspaceSlug } from '@/hooks/useWorkspaceSlug';

const initialValue: Value = [
  {
    type: 'p',
    children: [{ text: 'Start writing your content here...' }],
  },
];

export function PlateEditor() {
  const workspaceSlug = useWorkspaceSlug();

  const editor = usePlateEditor({
    plugins: EditorKit,
    value: () => {
      const savedContent = loadContent(workspaceSlug);
      return savedContent || initialValue;
    },
  });

  return (
    <Plate
      editor={editor}
      onChange={({ value }) => {
        saveContent(value, workspaceSlug);
      }}
    >
      <EditorContainer>
        <Editor variant='fullWidth' />
      </EditorContainer>
    </Plate>
  );
}
