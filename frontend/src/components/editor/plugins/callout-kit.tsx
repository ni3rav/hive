'use client';

import { CalloutPlugin } from '@platejs/callout/react';

import { CalloutElement } from '@/components/editor/callout-node';

export const CalloutKit = [CalloutPlugin.withComponent(CalloutElement)];
