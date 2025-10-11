import { BaseCommentPlugin } from '@platejs/comment';

import { CommentLeafStatic } from '@/components/editor/comment-node-static';

export const BaseCommentKit = [
  BaseCommentPlugin.withComponent(CommentLeafStatic),
];
