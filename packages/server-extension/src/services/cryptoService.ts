import crypto from 'crypto';
import nconf from 'nconf';

const algorithm = 'aes-256-cbc';
const iv = crypto.randomBytes(16);
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
      valid = this.decrypt(cipher) === text;
    } catch (error) {}

    return valid;
  }
};
