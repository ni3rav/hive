import { generateHTML } from '@tiptap/html';
import type { Editor } from '@tiptap/react';
import { getEditorExtensions } from './extensions';
import type { ProseMirrorJSON } from './persistence';

/**
 * Converts ProseMirror JSON to HTML string
 * Used when saving content to the API
 */
export function convertJSONToHTML(json: ProseMirrorJSON): string {
  const extensions = getEditorExtensions();
  return generateHTML(json, extensions);
}

/**
 * Checks if editor content is empty
 * Returns true if editor has no meaningful content
 */
export function hasTextContent(editor: Editor): boolean {
  const json = editor.getJSON();

  function checkNode(node: ProseMirrorJSON): boolean {
    if (
      node.type === 'text' &&
      node.text &&
      (node.text as string).trim().length > 0
    ) {
      return true;
    }
    if (node.content && Array.isArray(node.content)) {
      return node.content.some((child) => checkNode(child));
    }
    return false;
  }

  return checkNode(json);
}

export function isEditorEmpty(editor: Editor): boolean {
  const json = editor.getJSON();

  // Check if document is empty or only has empty paragraph
  if (!json.content || json.content.length === 0) {
    return true;
  }

  // Check if all content nodes are empty
  const hasContent = json.content.some((node) => {
    // If it's a paragraph, check if it has text content
    if (node.type === 'paragraph') {
      if (!node.content || node.content.length === 0) {
        return false;
      }
      return node.content.some(
        (child: ProseMirrorJSON) =>
          (child.type === 'text' &&
            child.text &&
            (child.text as string).trim().length > 0) ||
          child.type === 'image',
      );
    }
    // For other node types, consider them as having content
    return true;
  });

  return !hasContent;
}

/**
 * Gets both HTML and JSON content from editor
 * Used when saving posts to API
 */
export function getContentFromEditor(editor: Editor): {
  contentHtml: string;
  contentJson: ProseMirrorJSON;
} {
  const contentJson = editor.getJSON();
  const contentHtml = convertJSONToHTML(contentJson);

  return {
    contentHtml,
    contentJson,
  };
}
