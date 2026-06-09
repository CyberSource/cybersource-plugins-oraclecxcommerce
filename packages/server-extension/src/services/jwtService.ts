import jsonwebtoken, { Secret, SignOptions } from 'jsonwebtoken';
import { createPublicKey, createPrivateKey, KeyObject } from 'crypto';

export interface JsonJwt {
  header: any;
  payload: any;
}

export default {
  jwkToPem(jwk: any, isPrivate = false): string {
    if (isPrivate) {
      const key: KeyObject = createPrivateKey({ key: jwk, format: 'jwk' });
      return key.export({ type: 'pkcs8', format: 'pem' }) as string;
    }
    const key: KeyObject = createPublicKey({ key: jwk, format: 'jwk' });
    return key.export({ type: 'spki', format: 'pem' }) as string;
  },

  decode(jwt: string): JsonJwt {
    return jsonwebtoken.decode(jwt, { complete: true, json: true }) as JsonJwt;
  },

  verify(jwt: string, key: string) {
    return jsonwebtoken.verify(jwt, key);
  },

  getKid(jwt: string): string {
    return this.decode(jwt).header.kid;
  },

  sign(payload: any, key: Secret, options: SignOptions = { algorithm: 'HS256' }): string {
    return jsonwebtoken.sign(payload, key, options);
  },

  signatureVerify(captureContext: string, publicKey: any) {
    const publicKeyToPem = this.jwkToPem(publicKey);
    return jsonwebtoken.verify(captureContext, publicKeyToPem, { algorithms: ['RS256'] });
  }
};


