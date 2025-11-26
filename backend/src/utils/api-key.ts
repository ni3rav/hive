import { createHash, randomBytes, timingSafeEqual } from 'crypto';

const BASE62_ALPHABET =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const BASE62_REGEX = /^[0-9A-Za-z]+$/;
const WORKSPACE_KEY_PREFIX = 'hive';
export const WORKSPACE_API_KEY_RANDOM_LENGTH = 14;

export function generateWorkspaceApiKey(
  workspaceSlug: string,
  randomLength = WORKSPACE_API_KEY_RANDOM_LENGTH,
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

export function parseWorkspaceApiKey(apiKey: string): {
  workspaceSlug: string;
  randomSegment: string;
} | null {
  if (!apiKey.startsWith(`${WORKSPACE_KEY_PREFIX}-`)) {
    return null;
  }

  const remainder = apiKey.slice(WORKSPACE_KEY_PREFIX.length + 1);
  const delimiterIndex =
    remainder.length - (WORKSPACE_API_KEY_RANDOM_LENGTH + 1);

  if (delimiterIndex <= 0) {
    return null;
  }

  const workspaceSlug = remainder.slice(0, delimiterIndex);
  const separator = remainder[delimiterIndex];
  const randomSegment = remainder.slice(delimiterIndex + 1);

  if (
    separator !== '-' ||
    randomSegment.length !== WORKSPACE_API_KEY_RANDOM_LENGTH ||
    !BASE62_REGEX.test(randomSegment) ||
    workspaceSlug.length === 0
  ) {
    return null;
  }

  return {
    workspaceSlug,
    randomSegment,
  };
}
