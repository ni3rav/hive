import { createHash, randomBytes, timingSafeEqual } from 'crypto';

const BASE62_ALPHABET =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const WORKSPACE_KEY_PREFIX = 'hive';

export function generateWorkspaceApiKey(
  workspaceSlug: string,
  randomLength = 14,
): string {
  return `${WORKSPACE_KEY_PREFIX}-${workspaceSlug}-${generateBase62String(randomLength)}`;
}

function generateBase62String(length: number): string {
  const bytes = randomBytes(length);
  let result = '';

  for (let i = 0; i < length; i += 1) {
    const index = bytes[i] % BASE62_ALPHABET.length;
    result += BASE62_ALPHABET[index];
  }

  return result;
}

export function hashWorkspaceApiKey(apiKey: string): string {
  return createHash('sha256').update(apiKey).digest('hex');
}

export function verifyWorkspaceApiKey(
  apiKey: string,
  hashedKey: string,
): boolean {
  const digest = hashWorkspaceApiKey(apiKey);

  try {
    return timingSafeEqual(
      Buffer.from(digest, 'hex'),
      Buffer.from(hashedKey, 'hex'),
    );
  } catch {
    return false;
  }
}
