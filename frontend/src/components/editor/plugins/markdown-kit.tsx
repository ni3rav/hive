import { MarkdownPlugin, remarkMdx, remarkMention } from '@platejs/markdown';
import remarkGfm from 'remark-gfm';

export const MarkdownKit = [
  MarkdownPlugin.configure({
    options: {
      plainMarks: [],
      remarkPlugins: [remarkGfm, remarkMdx, remarkMention],
    },
  }),
];
