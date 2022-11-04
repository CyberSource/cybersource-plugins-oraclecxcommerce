import {getBodyAsJson} from '@oracle-cx-commerce/endpoints/factory';
import {populateError} from '@oracle-cx-commerce/endpoints/utils';
import {getOrderData} from '../../components/isv-payment-method';

/** This endpoint uses a public API for requesting contents from the url */
const url = '/ccstorex/custom/isv-payment/v2/payerAuth/generateJwt';

/**
 * Convert response data into an object to be merged into the application state.
 */
const processOutput = json => ({
  payerAuthRepository: {
    payerAuthToken: json
  }
});

/**
 * Return an object that implements the endpoint adapter interface.
 */
const payerAuthEndpoint = {
  /**
   * Return a Fetch API Request object to be used for invoking the endpoint.
   *
   * @param payload Optional payload to be included in the request
   * @param state The current application state
   * @return Request object for invoking the endpoint via Fetch API
   */

  async getRequest(payload) {
    const myBody = getOrderData();
    const myHeaders = new Headers();
    const channel = payload?.isPreview ? 'preview' : 'storefront';
    myHeaders.append('channel', channel);
    myHeaders.append('Accept', 'application/json');
    myHeaders.append('Content-Type', 'application/json');
    return new Request(url, {method: 'POST', headers: myHeaders, body: JSON.stringify(myBody)});
  },

  /**
   * Return a Fetch API Response object containing data from the endpoint.
   *
   * @param response The Response object returned by the fetch call
   * @param state The current application state
   * @param payload Optional payload that was included in the request
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

export default payerAuthEndpoint;
