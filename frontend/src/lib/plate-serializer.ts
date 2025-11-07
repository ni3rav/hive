import { serializeHtml } from 'platejs';
import type { PlateEditor } from 'platejs/react';
import type { Value } from 'platejs';

interface SerializeHtmlOptionsWithValue {
  value?: Value;
  stripClassNames?: boolean;
  stripDataAttributes?: boolean;
}

export async function serializePlateToHtml(
  editor: PlateEditor,
  value?: Value,
): Promise<string> {
  try {
    const options: SerializeHtmlOptionsWithValue = {
      stripClassNames: false,
      stripDataAttributes: true,
    };

    if (value) {
      options.value = value;
    }

    const html = await serializeHtml(
      editor,
      options as Parameters<typeof serializeHtml>[1],
    );

    return html;
  } catch (error) {
    console.error('Failed to serialize Plate content to HTML:', error);
    throw new Error('Failed to serialize content to HTML');
  }
}
