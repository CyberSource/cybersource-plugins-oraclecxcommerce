import { RequestContext, maskRequestData } from '@server-extension/common';
import { KeyGenerationApi } from 'cybersource-rest-client';
import makeRequest from './paymentCommand';
const { LogFactory } = require('@isv-occ-payment/occ-payment-factory');
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

  const logger = LogFactory.logger();
  logger.debug(`Generate Key API Request: ${JSON.stringify(maskRequestData(request))}`);

  return await makeRequest<any>(
    merchantConfig,
    KeyGenerationApi,
    'generatePublicKey',
    format,
    request
  );
}
