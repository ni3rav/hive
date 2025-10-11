import { Plate, usePlateEditor } from 'platejs/react';

import { EditorKit } from '@/components/editor/editor-kit';
import { Editor, EditorContainer } from '@/components/editor/editor';

export function PlateEditor() {
  const editor = usePlateEditor({
    plugins: EditorKit,
  });

  return (
    <Plate editor={editor}>
      <EditorContainer>
        <Editor variant='fullWidth' />
      </EditorContainer>
    </Plate>
  );
}
