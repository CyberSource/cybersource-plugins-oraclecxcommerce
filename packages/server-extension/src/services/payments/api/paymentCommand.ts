import { ApiExecutionError } from '@server-extension/errors';
import { ApiClient, MerchantConfig } from 'cybersource-rest-client';
const { LogFactory } = require('@isv-occ-payment/occ-payment-factory');

const logger = LogFactory.logger();
export const apiClient = new ApiClient();

export default async function makeRequest<T>(
  merchantConfig: MerchantConfig,
  apiClass: new (conf: MerchantConfig, client: ApiClient) => any,
  methodName: string,
  ...paymentArguments: any[]
): Promise<T> {
  const api = new apiClass(merchantConfig, apiClient);

  return new Promise((resolve, reject) => {
    api[methodName].bind(api)(...paymentArguments, (error: any, _data: any, response: any) => {
      if (error) {
        reject(
          new ApiExecutionError({
            api: apiClass.name,
            operation: methodName,
            status: error.status,
            source: error.response?.body
          })
        );
      } else {
        logger.debug(`API Response [${methodName}] : ${JSON.stringify(response?.body)}`);
        resolve(response?.body);
      }
    });
  });
}
