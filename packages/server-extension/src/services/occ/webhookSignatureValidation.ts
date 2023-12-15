import crypto from 'crypto';
import { LogFactory } from '@isv-occ-payment/occ-payment-factory';

const logger = LogFactory.logger();

function validateWebHookPayloadSignature(
  rawBody: string,
  webhookSignature: string,
  secret: string,
  algorithm = 'sha512'
) {
  // Secret key is base64 encoded and must be decoded into bytes
  const decoded_secret_key = Buffer.from(secret, 'base64');
  const calculated_signature = crypto
    .createHmac(algorithm, decoded_secret_key)
    .update(rawBody)
    .digest('base64');
  logger.debug("Calculated signature: " + calculated_signature);
  if (calculated_signature != webhookSignature) {
    throw new Error('Invalid signature. Access denied');
  }
}

export default validateWebHookPayloadSignature;
