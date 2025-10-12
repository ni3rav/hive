import { Plate, usePlateEditor } from 'platejs/react';
import type { Value } from 'platejs';

import { EditorKit } from '@/components/editor/editor-kit';
import { Editor, EditorContainer } from '@/components/editor/editor';
import { loadContent, saveContent } from '@/components/editor/persistence';

const initialValue: Value = [
  {
    type: 'p',
    children: [{ text: 'Start writing your content here...' }],
  },
];

export function PlateEditor() {
  const editor = usePlateEditor({
    plugins: EditorKit,
    value: () => {
      const savedContent = loadContent();
      return savedContent || initialValue;
    },
  });

  return (
    <Plate
      editor={editor}
      onChange={({ value }) => {
        saveContent(value);
      }}
    >
      <EditorContainer>
        <Editor variant='fullWidth' />
      </EditorContainer>
    </Plate>
  );
}
