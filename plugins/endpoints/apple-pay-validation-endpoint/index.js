import { createEndpoint, getBodyAsJson } from '@oracle-cx-commerce/endpoints/factory';
import { populateError } from '@oracle-cx-commerce/endpoints/utils';
import { CHANNEL, APPLE_PAY_URL } from '../../components/constants';

/**
 * Handle request input to get product configuration.
  * @param body Optional payload to be included in the request
 * @return {Object} Updated request object
 */

export const processInput = body => {
  const validationUrl = body.validationUrl;
  const payloadData = {
    ...{ validationUrl }
  }

  return {
    params: [APPLE_PAY_URL],
    body: payloadData,
    headers:{Channel:body?.isPreview ? CHANNEL.PREVIEW : CHANNEL.STOREFRONT}
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
    applePayRepository: {
      sessionData: configuration
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






