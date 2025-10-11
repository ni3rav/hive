import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import Typography from '@tiptap/extension-typography';
import Underline from '@tiptap/extension-underline';
import StarterKit from '@tiptap/starter-kit';
import SearchAndReplace from '@/components/tiptap/extensions/search-and-replace';

export const extensions = [
  StarterKit.configure({
    orderedList: { HTMLAttributes: { class: 'list-decimal' } },
    bulletList: { HTMLAttributes: { class: 'list-disc' } },
    heading: { levels: [1, 2, 3, 4] },
  }),
  Placeholder.configure({
    emptyNodeClass: 'is-editor-empty',
    placeholder: ({ node }) => {
      switch (node.type.name) {
        case 'heading':
          return `Heading ${node.attrs.level}`;
        case 'detailsSummary':
          return 'Section title';
        case 'codeBlock':
          return '';
        default:
          return 'Start typing...';
      }
    },
    includeChildren: false,
  }),
  TextAlign.configure({ types: ['heading', 'paragraph'] }),
  TextStyle,
  Subscript,
  Superscript,
  Underline,
  Link,
  Color,
  Highlight.configure({ multicolor: true }),
  SearchAndReplace,
  Typography,
];
