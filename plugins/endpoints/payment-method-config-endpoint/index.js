import { createEndpoint, getBodyAsJson } from '@oracle-cx-commerce/endpoints/factory';
import { populateError } from '@oracle-cx-commerce/endpoints/utils';
import { PAYMENT_METHODS_URL , CHANNEL} from '../../components/constants';

/**
 * Handle request input to get product configuration.
 * @param payload {Object} [{}] Request payload
 * @return {Object} Updated request object
 */

export const processInput = payload => {
  return {
    params: [PAYMENT_METHODS_URL],
    headers:{Channel:payload?.isPreview ? CHANNEL.PREVIEW : CHANNEL.STOREFRONT}
  };
};
/**
 * Handle response output and add to application state.
 * @param response {Object} [{}] Response object
 * @return  Updated application state
 */

export const processOutput = async response => {
  const configuration = await getBodyAsJson(response);
  if (!response.ok) {
    return populateError(response, configuration);
  }
  const { deviceFingerprintData } = configuration?.deviceFingerprint || {};

  return {
    paymentMethodConfigRepository: {
      ...configuration,
      deviceFingerprint: {
        ...configuration.deviceFingerprint,
        deviceFingerprintData: {
          deviceFingerprintSessionId: deviceFingerprintData.sessionId,
          deviceFingerprintCipherEncrypted: deviceFingerprintData.cipher.encrypted,
          deviceFingerprintCipherIv: deviceFingerprintData.cipher.iv
        }
      }
    }
  };
};

/**
 * Create endpoint for server-side extension route
 * @param endpoint {string} Endpoint identifier
 * @param options {Object} Process input and output functions
 * @return {Object} Endpoint
 */
export default createEndpoint('extget', {
  processInput,
  processOutput
});







