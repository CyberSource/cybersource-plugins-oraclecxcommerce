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

  // Use constant-time comparison to prevent timing attacks
  const calculatedBuffer = Buffer.from(calculated_signature);
  const providedBuffer = Buffer.from(webhookSignature);

  // Check length equality first (timingSafeEqual requires same length)
  if (calculatedBuffer.length !== providedBuffer.length) {
    logger.debug("Signature validation failed: length mismatch");
    throw new Error('Invalid signature. Access denied');
  }

  // Perform constant-time comparison to prevent timing side-channel attacks
  if (!crypto.timingSafeEqual(calculatedBuffer, providedBuffer)) {
    logger.debug("Signature validation failed: signature mismatch");
    throw new Error('Invalid signature. Access denied');
  }

  logger.debug("Signature validation successful");
}

export default validateWebHookPayloadSignature;
