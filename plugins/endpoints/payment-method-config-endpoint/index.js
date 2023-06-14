import { getBodyAsJson } from '@oracle-cx-commerce/endpoints/factory';
import { populateError } from '@oracle-cx-commerce/endpoints/utils';
import { CHANNEL, PAYMENT_METHODS_URL } from '../../components/constants';

/**
 * Convert response data into an object to be merged into the application state.
 */

const processOutput = json => {
  const { deviceFingerprintData } = json?.deviceFingerprint || {};

  return {
    paymentMethodConfigRepository: {
      ...json,
      deviceFingerprint: {
        ...json.deviceFingerprint,
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
 * Return an object that implements the endpoint adapter interface.
 */
const paymentMethodConfigEndpoint = {
  /**
   * Return a Fetch API Request object to be used for invoking the endpoint.
   *
   * @param payload Optional payload to be included in the request
   * @return Request object for invoking the endpoint via Fetch API
   */
  async getRequest(payload) {
    return new Request(PAYMENT_METHODS_URL, {
      method: 'GET',
      headers: { channel: payload?.isPreview ? CHANNEL.PREVIEW : CHANNEL.STOREFRONT }
    });
  },

  /**
   * Return a Fetch API Response object containing data from the endpoint.
   *
   * @param response The Response object returned by the fetch call
   * @return Response object, augmented with an async getJson function to return
   * an object to be merged into the application state
   */
  getResponse(response) {
    let json;
    response.getJson = async () => {
      if (json === undefined) {
        json = await getBodyAsJson(response);
        return response.ok ? processOutput(json) : populateError(response, json);
      }
      return json;
    };
    return response;
  }
};

export default paymentMethodConfigEndpoint;
