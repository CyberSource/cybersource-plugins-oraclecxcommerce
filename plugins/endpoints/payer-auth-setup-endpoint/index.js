import { getBodyAsJson } from '@oracle-cx-commerce/endpoints/factory';
import { populateError } from '@oracle-cx-commerce/endpoints/utils';
import { CHANNEL, PAYER_AUTH_SETUP_URL } from '../../components/constants';


/**
 * Convert response data into an object to be merged into the application state.
 */
const processOutput = json => ({
  payerAuthSetupRepository: {
    accessToken: json.accessToken,
    deviceDataCollectionUrl: json.deviceDataCollectionUrl,
    referenceId: json.referenceId
  }
});
/**
 * Return an object that implements the endpoint adapter interface.
 */
const payerAuthSetupEndpoint = {
  /**
   * Return a Fetch API Request object to be used for invoking the endpoint.
   *
   * @param payload  payload to be included in the request
   * @return Request object for invoking the endpoint via Fetch API
   */
  async getRequest(payload) {
    const myBody = payload.setupPayload;
    const myHeaders = new Headers();
    const channel = payload?.isPreview ? CHANNEL.PREVIEW : CHANNEL.STOREFRONT;
    myHeaders.append('Channel', channel);
    myHeaders.append('Accept', 'application/json');
    myHeaders.append('Content-Type', 'application/json');
    return new Request(PAYER_AUTH_SETUP_URL, { method: 'POST', headers: myHeaders, body: JSON.stringify(myBody) });
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

export default payerAuthSetupEndpoint;