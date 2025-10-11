import { BlockMenuPlugin } from '@platejs/selection/react';

import { BlockContextMenu } from '@/components/editor/block-context-menu';

import { BlockSelectionKit } from './block-selection-kit';

export const BlockMenuKit = [
  ...BlockSelectionKit,
  BlockMenuPlugin.configure({
    render: { aboveEditable: BlockContextMenu },
  }),
];
