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
export function isEditorEmpty(editor: Editor): boolean {
  const json = editor.getJSON();

  // DEBUG: Log the entire JSON structure
  console.log('=== DEBUG isEditorEmpty ===');
  console.log('JSON structure:', JSON.stringify(json, null, 2));

  // Check if document is empty or only has empty paragraph
  if (!json.content || json.content.length === 0) {
    console.log('Empty: no content');
    return true;
  }

  // DEBUG: Log each node type
  json.content.forEach((node, index) => {
    console.log(`Node ${index} type:`, node.type);
    if (node.content) {
      console.log(`Node ${index} children:`, node.content.map((c: ProseMirrorJSON) => c.type));
    }
  });

  // Check if all content nodes are empty
  const hasContent = json.content.some((node) => {
    // If it's a paragraph, check if it has ANY content (text, images, etc.)
    if (node.type === 'paragraph') {
      if (!node.content || node.content.length === 0) {
        return false;
      }
      // Check if any child node has content (text, image, video, etc.)
      return node.content.some(
        (child: ProseMirrorJSON) => {
          // Text nodes with content
          if (child.type === 'text' && child.text && (child.text as string).trim().length > 0) {
            return true;
          }
          // Image, video, or other inline nodes
          if (child.type && ['image', 'video', 'hardBreak'].includes(child.type)) {
            return true;
          }
          return false;
        },
      );
    }
    // For other node types, consider them as having content
    return true;
  });

  console.log('Has content:', hasContent);
  console.log('=== END DEBUG ===');
  return !hasContent;
}

/**
 * Checks if editor content contains only media (images/videos) without text
 * Returns true if the content has only media nodes and no text content
 */
export function hasOnlyMediaContent(editor: Editor): boolean {
  const json = editor.getJSON();

  // Check if document is empty
  if (!json.content || json.content.length === 0) {
    return false;
  }

  let hasMedia = false;
  let hasText = false;

  // Recursively check nodes for media and text
  const checkNode = (node: ProseMirrorJSON) => {
    // Check if it's a media node (image or video)
    if (node.type === 'image' || node.type === 'video') {
      hasMedia = true;
      return;
    }

    // Check if it's a text node with content
    if (node.type === 'text' && node.text && (node.text as string).trim().length > 0) {
      hasText = true;
      return;
    }

    // Check if it's a heading or other content node
    if (node.type && ['heading', 'blockquote', 'codeBlock', 'orderedList', 'bulletList', 'listItem'].includes(node.type)) {
      hasText = true;
      return;
    }

    // Recursively check children if they exist
    if (node.content && Array.isArray(node.content)) {
      node.content.forEach((child: ProseMirrorJSON) => checkNode(child));
    }
  };

  // Check each top-level node
  json.content.forEach((node) => checkNode(node));

  // Return true only if there's media but no text
  return hasMedia && !hasText;
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
