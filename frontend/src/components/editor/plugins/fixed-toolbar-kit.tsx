'use client';

import { createPlatePlugin } from 'platejs/react';

import { FixedToolbar } from '@/components/editor/fixed-toolbar';
import { FixedToolbarButtons } from '@/components/editor/fixed-toolbar-buttons';

export const FixedToolbarKit = [
  createPlatePlugin({
    key: 'fixed-toolbar',
    render: {
      beforeEditable: () => (
        <FixedToolbar>
          <FixedToolbarButtons />
        </FixedToolbar>
      ),
    },
  }),
];
