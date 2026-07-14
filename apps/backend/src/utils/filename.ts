export function sanitizeFilename(filename: string): string {
  if (!filename || filename.trim().length === 0) {
    return 'untitled';
  }

  const lastDotIndex = filename.lastIndexOf('.');
  let name = filename;
  let extension = '';

  if (lastDotIndex > 0 && lastDotIndex < filename.length - 1) {
    name = filename.substring(0, lastDotIndex);
    extension = filename.substring(lastDotIndex);
  }

  const sanitized = name
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^[._-]+|[._-]+$/g, '');

  if (sanitized.length === 0) {
    return 'untitled' + extension;
  }

  const result = sanitized + extension;

  if (result.length > 255) {
    const maxNameLength = 255 - extension.length;
    return result.substring(0, maxNameLength) + extension;
  }

  return result;
}
