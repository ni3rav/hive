import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import { TextStyle, FontFamily } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { TableKit } from '@tiptap/extension-table';

/**
 * Shared extensions list used by both the editor and HTML utilities
 */
export const getEditorExtensions = () => [
  StarterKit.configure({
    heading: {
      levels: [1, 2, 3, 4, 5, 6],
    },
    // Disable link and underline since we're configuring them separately below
    link: false,
    underline: false,
  }),
  TableKit.configure({
    table: {
      resizable: true,
      HTMLAttributes: {
        class: 'tiptap-table',
      },
    },
    tableCell: {
      HTMLAttributes: {
        class: 'tiptap-table-cell',
      },
    },
    tableHeader: {
      HTMLAttributes: {
        class: 'tiptap-table-header',
      },
    },
    tableRow: {
      HTMLAttributes: {
        class: 'tiptap-table-row',
      },
    },
  }),
  Underline,
  Link.configure({
    openOnClick: false,
    HTMLAttributes: {
      class: 'tiptap-link',
    },
  }),
  TextAlign.configure({
    types: ['heading', 'paragraph'],
    defaultAlignment: 'left',
  }),
  TextStyle,
  FontFamily.configure({
    types: ['textStyle', 'paragraph', 'heading', 'listItem'],
  }),
  Color,
  Highlight.configure({
    multicolor: true,
  }),
  Placeholder.configure({
    placeholder: 'Start writing...',
  }),
];
