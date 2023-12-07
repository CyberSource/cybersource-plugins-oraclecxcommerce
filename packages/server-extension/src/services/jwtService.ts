import jsonwebtoken, { Secret, SignOptions } from 'jsonwebtoken';
import toPem, { JWK } from 'jwk-to-pem';

export interface JsonJwt {
  header: any;
  payload: any;
}

export default {
  jwkToPem(jwk: JWK, isPrivate = false): string {
    return toPem(jwk, {
      private: isPrivate
    });
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

  signatureVerify(captureContext: string, publicKey: JWK) {
    const publicKeyToPem = this.jwkToPem(publicKey);
    return jsonwebtoken.verify(captureContext, publicKeyToPem, { algorithms: ['RS256'] });
  }
};


