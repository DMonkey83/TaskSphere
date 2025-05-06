import * as crypto from 'crypto';

const algorithm = 'aes-245-cbc';

export function encrypt(
  text: string,
  key: string,
  iv: crypto.BinaryLike | null,
): string {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'hex', 'utf-8');
  encrypted += cipher.final('hex');
  return encrypted;
}

export function decrypt(
  encrypted: string,
  key: string,
  iv: crypto.BinaryLike | null,
): string {
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf-8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
