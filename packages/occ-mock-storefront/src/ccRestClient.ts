import fetch, { Response } from 'node-fetch';

const checkStatus = (res: Response) => {
  if (res.ok) return res;
  throw new Error(res.statusText);
};

const BASE_URL = `${process.env.BASE_MOCK_API_HOST}/ccstore/v1`;

type SuccessCallback = (json: any) => void;
type ErrorCallback = (error: Error) => void;

const REGISTRY: Record<string, any> = {
  listCreditCards: {
    url: 'profiles/current/creditCards',
    method: 'get'
  },
  updateCreditCard: {
    url: 'profiles/current/creditCards',
    method: 'put'
  },
  removeCreditCard: {
    url: 'profiles/current/creditCards',
    method: 'delete'
  },
  createOrder: {
    url: 'orders',
    method: 'post'
  }
};

const ccRestClient = {
  request: async (
    url: string,
    payload: any,
    success: SuccessCallback,
    fail: ErrorCallback,
    param?: string
  ) => {
    try {
      const endpointMetadata = REGISTRY[url];
      const endpoint = endpointMetadata.url + (param ? '/' + param : '');

      const requestBody = endpointMetadata.method !== 'get' && {
        body: JSON.stringify(payload)
      };

      const res = checkStatus(
        await fetch(`${BASE_URL}/${endpoint}`, {
          method: endpointMetadata.method,
          headers: {
            'Content-Type': 'application/json',
            channel: 'storefront'
          },
          ...requestBody
        })
      );
      const responseBody = await res.json();
      success(responseBody);
    } catch (e) {
      fail(e);
    }
  },

  loggedIn: true
};

export default ccRestClient;
