import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';

const secretKey = process.env.ENCRYPTION_SECRET_KEY;

if (!secretKey) {
  throw new Error('A variável de ambiente ENCRYPTION_SECRET_KEY não está definida.');
}

const searchSalt = process.env.ENCRYPTION_SEARCH_SALT;

if (!searchSalt) {
  throw new Error('A variável de ambiente ENCRYPTION_SEARCH_SALT não está definida.');
}

const key = createHash('sha256').update(String(secretKey)).digest('base64').substring(0, 32);

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;

export function encrypt(text: string | null | undefined): string | null {
  if (text == null) {
    return null;
  }

  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(String(text), 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decrypt(hash: string | null | undefined): string | null {
  if (hash == null) {
    return null;
  }

  try {
    const parts = hash.split(':');
    if (parts.length !== 3) {
      return hash;
    }

    const [ivHex, authTagHex, encryptedHex] = parts;

    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');

    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString('utf8');
  } catch (error) {
    console.error('Falha ao descriptografar:', error);
    return hash;
  }
}

export function createSearchableHash(text: string | null | undefined): string | null {
  if (text == null) {
    return null;
  }

  return createHash('sha256')
    .update(String(text) + searchSalt)
    .digest('hex');
}
