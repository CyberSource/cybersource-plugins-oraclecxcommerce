import makeRequest from "./paymentCommand";
import subscribeApi from "../converters/response/subscribeApi";
import { MerchantConfig } from "cybersource-rest-client";
import { PaymentContext } from "@server-extension/common";
import { WEBHOOK_SUBSCRIPTION } from "../converters/request/common";
const { LogFactory } = require('@isv-occ-payment/occ-payment-factory');
const logger = LogFactory.logger();


export async function keyGeneration(merchantConfig:MerchantConfig){
  let keyGenerationResponse: OCC.keyGenerationResponse|null = null
    try{ 
    const keyGenerationPayload = {
        clientRequestAction: WEBHOOK_SUBSCRIPTION.CREATE, 
        keyInformation: {
          provider: WEBHOOK_SUBSCRIPTION.PROVIDER,
          tenant: merchantConfig.merchantID,
          keyType: WEBHOOK_SUBSCRIPTION.KEY_TYPE,
          organizationId: merchantConfig.merchantID
        }
      };
      logger.debug("Webhook Subscription : Calling Key Generation API");
        keyGenerationResponse = await makeRequest(
        merchantConfig,
        subscribeApi,
        "keyGeneration",
        keyGenerationPayload
      );
    }catch(error){
        logger.debug("Webhook Subscription : " + error);
    }finally{
    return keyGenerationResponse;
    }
}

export async function webhookSubscription(merchantConfig:MerchantConfig,context:PaymentContext,webhookurl:string){
    let webhookSubscriptionResponse: OCC.webhookSubscriptionResponse|null = null;
    try{
    const subscriptionPayload = {
        name: WEBHOOK_SUBSCRIPTION.WEBHOOK_NAME,
        description: WEBHOOK_SUBSCRIPTION.WEBHOOK_DESCRIPTION,
        organizationId: context.requestContext?.merchantConfig?.merchantID,
        productId: WEBHOOK_SUBSCRIPTION.PRODUCT_ID,
        eventTypes: [
          WEBHOOK_SUBSCRIPTION.EVENT_TYPE
        ],
        webhookUrl: webhookurl,
        healthCheckUrl: webhookurl,
        securityPolicy: {
          securityType: WEBHOOK_SUBSCRIPTION.SECURITY_TYPE,
          proxyType: WEBHOOK_SUBSCRIPTION.PROXY_TYPE
        }
      }
      logger.debug("Webhook Subscription Payload : " + JSON.stringify(subscriptionPayload));
       webhookSubscriptionResponse = await makeRequest(
        merchantConfig,
        subscribeApi,
        "webhookSubscription",
        subscriptionPayload
      );
    }catch(error){
        logger.debug("Webhook Subscription Response: " + error);
    }finally{
      return webhookSubscriptionResponse;
    }
}

export async function getSubscriptionsDetails(merchantConfig: MerchantConfig): Promise<false | OCC.SubscriptionDetailsResponse> {
    return new Promise(async (resolve) => {
      try {
        const getAllSubscriptions: OCC.SubscriptionDetailsResponse = await makeRequest(
          merchantConfig,
          subscribeApi,
          "retreiveAllSubscriptions",
          merchantConfig.merchantID
        );
        resolve(getAllSubscriptions);
      }
      catch (error) {
        logger.debug("Webhook Subscription : " + error.message);
        logger.debug("Webhook Subscription : Not subscribed to ISV webhook");
        resolve(false)
      };
    });
  };
