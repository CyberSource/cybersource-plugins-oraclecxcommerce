import { ApiExecutionError } from '@server-extension/errors';
import { maskRequestData } from '@server-extension/common';
import { ApiClient, MerchantConfig } from 'cybersource-rest-client';
const { LogFactory } = require('@isv-occ-payment/occ-payment-factory');

const logger = LogFactory.logger();

/**
 * Makes a request to the Cybersource API
 * Creates a new ApiClient instance per request to prevent race conditions and credential mix-ups
 * between concurrent requests from different merchants
 */
export default async function makeRequest<T>(
  merchantConfig: MerchantConfig,
  apiClass: new (conf: MerchantConfig, client: ApiClient) => any,
  methodName: string,
  ...paymentArguments: any[]
): Promise<T> {
  // Create a new ApiClient instance per request to ensure thread-safe isolation
  // This prevents concurrent requests from different merchants from sharing state
  const apiClient = new ApiClient();
  const api = new apiClass(merchantConfig, apiClient);
  return new Promise((resolve, reject) => {
    api[methodName].bind(api)(...paymentArguments, (error: any, data: any, response: any) => {
      try{
      if (error) {
        reject(
          new ApiExecutionError({
            api: apiClass.name,
            operation: methodName,
            status: error.status,
            source: response?.text
          })
        );
      }
      else {
        let paymentResponse = data;
        let parsedResponse =  JSON.parse(response?.text);
        if(parsedResponse?.riskInformation){
          paymentResponse.riskInformation =  parsedResponse.riskInformation;
        }
        logger.debug(`API Response [${methodName}] : ${JSON.stringify(maskRequestData(paymentResponse))}`);
        resolve(paymentResponse);
      }
      }catch(error){
        reject(error);
      }
    });
  });
}

/**
 * Makes a request to the Cybersource API with a configurable ApiClient
 * Used for special cases like report downloads where the ApiClient needs additional configuration
 * @param merchantConfig Merchant configuration
 * @param apiClass API class constructor
 * @param methodName Method name to call
 * @param apiClientConfigurator Function to configure the ApiClient before use
 * @param paymentArguments Arguments to pass to the API method
 */
export async function makeRequestWithConfigurableClient<T>(
  merchantConfig: MerchantConfig,
  apiClass: new (conf: MerchantConfig, client: ApiClient) => any,
  methodName: string,
  apiClientConfigurator: (client: ApiClient) => void,
  ...paymentArguments: any[]
): Promise<T> {
  // Create a new ApiClient instance per request to ensure thread-safe isolation
  const apiClient = new ApiClient();

  apiClientConfigurator(apiClient);

  const api = new apiClass(merchantConfig, apiClient);
  return new Promise((resolve, reject) => {
    api[methodName].bind(api)(...paymentArguments, (error: any, data: any, response: any) => {
      try{
      if (error) {
        reject(
          new ApiExecutionError({
            api: apiClass.name,
            operation: methodName,
            status: error.status,
            source: response?.text
          })
        );
      }
      else {
        let paymentResponse = data;
        let parsedResponse =  JSON.parse(response?.text);
        if(parsedResponse?.riskInformation){
          paymentResponse.riskInformation =  parsedResponse.riskInformation;
        }
        logger.debug(`API Response [${methodName}] : ${JSON.stringify(maskRequestData(paymentResponse))}`);
        resolve(paymentResponse);
      }
      }catch(error){
        reject(error);
      }
    });
  });
}
 