import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

export async function hashPassword(
  password: string,
): Promise<[Error | null, string | null]> {
  try {
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    return [null, hash];
  } catch (err) {
    console.error('Error hashing password:', err);
    return [err as Error, null];
  }
}

export async function verifyPassword(
  password: string,
  hashedPassword: string,
): Promise<[Error | null, boolean | null]> {
  try {
    const isValid = await bcrypt.compare(password, hashedPassword);
    return [null, isValid];
  } catch (err) {
    console.error('Error verifying password:', err);
    return [err as Error, null];
  }
}
