import { createEndpoint, getBodyAsJson } from '@oracle-cx-commerce/endpoints/factory';
import { populateError } from '@oracle-cx-commerce/endpoints/utils';
import { CHANNEL, PAYER_AUTH_SETUP_URL } from '../../components/constants';

/**
 * Handle request input to get product configuration.
 * @param payload {Object} [{}] Request payload
 * @return {Object} Updated request object
 */

export const processInput = payload => {
  const payloadData = {
    ...payload.setupPayload
  }

  return {
    params: [PAYER_AUTH_SETUP_URL],
    body: payloadData,
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
  return {
    payerAuthSetupRepository: {
      accessToken: configuration.accessToken,
      deviceDataCollectionUrl: configuration.deviceDataCollectionUrl,
      referenceId: configuration.referenceId
    }
  };
};

/**
 * Create endpoint for server-side extension route
 * @param endpoint {string} Endpoint identifier
 * @param options {Object} Process input and output functions
 * @return {Object} Endpoint
 */
export default createEndpoint('extpost', {
  processInput,
  processOutput
});






