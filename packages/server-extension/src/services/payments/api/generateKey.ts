import { RequestContext, maskRequestData, CLIENT_VERSION } from '@server-extension/common';
import { MicroformIntegrationApi } from 'cybersource-rest-client';
import makeRequest from './paymentCommand';
const { LogFactory } = require('@isv-occ-payment/occ-payment-factory');
const logger = LogFactory.logger();

export default async function generateKey(
  context: RequestContext,
  targetOrigin: string,
  allowedCardNetworks: string[],
) {
  const { merchantConfig } = context;
  const request = {
    clientVersion: CLIENT_VERSION,
    targetOrigins: [targetOrigin],
    allowedCardNetworks: allowedCardNetworks
  };
  logger.debug(`Generate Key API Request: ${JSON.stringify(maskRequestData(request))}`);
  return await makeRequest<any>(
    merchantConfig,
    MicroformIntegrationApi,
    'generateCaptureContext',
    request
  );
}

