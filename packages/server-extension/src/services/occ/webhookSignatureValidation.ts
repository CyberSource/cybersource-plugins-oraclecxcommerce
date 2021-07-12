import crypto from 'crypto';

function validateWebHookPayloadSignature(
  rawBody: string,
  webhookSignature: string,
  secret: string
) {
  // Secret key is base64 encoded and must be decoded into bytes
  const decoded_secret_key = Buffer.from(secret, 'base64');

  const calculated_signature = crypto
    .createHmac('sha1', decoded_secret_key)
    .update(rawBody)
    .digest('base64');

  if (calculated_signature != webhookSignature) {
    throw new Error('Invalid signature. Access denied');
  }
}

export default validateWebHookPayloadSignature;
