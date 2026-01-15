import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import { TextStyle, FontFamily } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { TableKit } from '@tiptap/extension-table';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Youtube from '@tiptap/extension-youtube';
import Image from '@tiptap/extension-image';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { SlashCommand } from './slash-command/extension';
import { getSuggestionItems, renderItems } from './slash-command/suggestion';
import { ImageNodeView } from './ImageNodeView';

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
  TaskList.configure({
    itemTypeName: 'taskItem',
    HTMLAttributes: {
      class: 'tiptap-task-list',
    },
  }),
  TaskItem.configure({
    nested: true,
    HTMLAttributes: {
      class: 'tiptap-task-item',
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
    placeholder: "Type '/' for commands...",
  }),
  Youtube.configure({
    inline: false,
    width: 640,
    height: 360,
    controls: true,
    allowFullscreen: true,
    HTMLAttributes: {
      class: 'youtube-video',
    },
  }),
  Image.configure({
    inline: true,
    allowBase64: false,
    HTMLAttributes: {
      class: 'tiptap-image',
    },
  }).extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        src: {
          default: null,
          parseHTML: (element) => element.getAttribute('src'),
          renderHTML: (attributes) => {
            if (!attributes.src) {
              return {};
            }
            return { src: attributes.src };
          },
        },
        'data-media-id': {
          default: null,
          parseHTML: (element) => element.getAttribute('data-media-id'),
          renderHTML: () => {
            return {};
          },
        },
        class: {
          default: 'tiptap-image',
          parseHTML: (element) => element.getAttribute('class'),
          renderHTML: (attributes) => {
            return {
              class: attributes.class,
            };
          },
        },
      };
    },
    addNodeView() {
      return ReactNodeViewRenderer(ImageNodeView);
    },
  }),
  SlashCommand.configure({
    suggestion: {
      items: getSuggestionItems,
      render: renderItems,
    },
  }),
];
