import { SimpleEditor as TiptapSimpleEditor } from '@/components/tiptap-templates/simple/simple-editor'

export function SimpleEditor() {
  return (
    <div className="w-full" style={{ margin: '0 !important', padding: '0 !important' }}>
      <TiptapSimpleEditor />
    </div>
  )
}