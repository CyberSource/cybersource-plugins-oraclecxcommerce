import crypto from 'crypto';
import nconf from 'nconf';

const algorithm = 'aes-256-cbc';
const encoding = 'base64';

const DEFAULT_KEY = crypto.randomBytes(32);
const getKey = () => {
  const keyFromConfig = nconf.get('crypto.service.key');

  return keyFromConfig
    ? crypto.createHash('sha256').update(keyFromConfig).digest('base64').substr(0, 32)
    : DEFAULT_KEY;
};

export default {
  encrypt(text: string): OCC.EncryptedText {
    // Generate a fresh random IV for each encryption operation to prevent IV reuse attacks
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(getKey()), iv);

    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return { iv: iv.toString(encoding), encrypted: encrypted.toString(encoding) };
  },

  decrypt(cipher: OCC.EncryptedText) {
    const iv = Buffer.from(cipher.iv, encoding);
    const encryptedText = Buffer.from(cipher.encrypted, encoding);

    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(getKey()), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
  },

  validate(text: string, cipher: OCC.EncryptedText) {
    let valid = false;
    try {
      const decrypted = this.decrypt(cipher);
      // Use constant-time comparison to prevent timing attacks
      const textBuffer = Buffer.from(text, 'utf8');
      const decryptedBuffer = Buffer.from(decrypted, 'utf8');

      // Check length equality first (timingSafeEqual requires same length)
      if (textBuffer.length === decryptedBuffer.length) {
        valid = crypto.timingSafeEqual(textBuffer, decryptedBuffer);
      }
    } catch (error) {}

    return valid;
  }
};
