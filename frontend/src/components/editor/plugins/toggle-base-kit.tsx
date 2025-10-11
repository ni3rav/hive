import { BaseTogglePlugin } from '@platejs/toggle';

import { ToggleElementStatic } from '@/components/editor/toggle-node-static';

export const BaseToggleKit = [
  BaseTogglePlugin.withComponent(ToggleElementStatic),
];
