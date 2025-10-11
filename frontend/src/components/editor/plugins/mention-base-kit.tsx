import { BaseMentionPlugin } from '@platejs/mention';

import { MentionElementStatic } from '@/components/editor/mention-node-static';

export const BaseMentionKit = [
  BaseMentionPlugin.withComponent(MentionElementStatic),
];
