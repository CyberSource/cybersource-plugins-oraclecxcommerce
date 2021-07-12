import { RequestContext } from '@server-extension/common';
import { KeyGenerationApi } from 'cybersource-rest-client';
import makeRequest from './paymentCommand';

const FLEX_ENCRYPTION_TYPE = 'RsaOaep';

export default async function generateKey(
  context: RequestContext,
  targetOrigin: string,
  format = 'JWT'
) {
  const { merchantConfig } = context;

  const request = {
    encryptionType: FLEX_ENCRYPTION_TYPE,
    targetOrigin: targetOrigin
  };

  return await makeRequest<any>(
    merchantConfig,
    KeyGenerationApi,
    'generatePublicKey',
    format,
    request
  );
}
