import validateWebHookPayloadSignature from '@server-extension/services/occ/webhookSignatureValidation';
import crypto from 'crypto';

const PAYLOAD = 'payload';
const SECRET = Buffer.from('secret').toString('base64');

const PAYLOAD_BUFFER = Buffer.from(PAYLOAD);
const SIGNATURE = crypto.createHmac('sha1', 'secret').update(PAYLOAD_BUFFER).digest('base64');

describe('Webhook Signature Validation', () => {
  it('Should validate signature of incoming Webhook request', () => {
    expect(() => validateWebHookPayloadSignature(PAYLOAD, SIGNATURE, SECRET)).not.toThrowError();
  });

  it('Should throw error if signature validation failed', () => {
    expect(() =>
      validateWebHookPayloadSignature(PAYLOAD, 'invalid signature', SECRET)
    ).toThrowError('Invalid signature. Access denied');
  });

  it('Should throw error if secret key is invalid', () => {
    expect(() =>
      validateWebHookPayloadSignature(PAYLOAD, SIGNATURE, 'invalid secret')
    ).toThrowError('Invalid signature. Access denied');
  });
});
