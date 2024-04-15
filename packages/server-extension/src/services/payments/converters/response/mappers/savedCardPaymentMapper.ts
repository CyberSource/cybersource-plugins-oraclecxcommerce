import { PaymentContext } from '@server-extension/common';
import { MerchantConfig, PtsV2PaymentsPost201Response } from 'cybersource-rest-client';
import { PaymentResponseMapper } from '../../common';
import makeRequest from '@server-extension/services/payments/api/paymentCommand';
import { getSubscriptionsDetails, keyGeneration, webhookSubscription } from '@server-extension/services/payments/api/processWebhookSubscription';
import subscribeApi from '../subscribeApi';
import nconf from 'nconf';
import { WEBHOOK_SUBSCRIPTION } from '../../request/common';
const { LogFactory } = require('@isv-occ-payment/occ-payment-factory');
const logger = LogFactory.logger();

export const mapInstrumentIdentifier = (res: Record<string, any>): string => {
  return res.tokenInformation.instrumentIdentifier.id;
};

export const savedCardPaymentMapper: PaymentResponseMapper = {
  supports: (context: PaymentContext) =>
    Boolean(
      context.data.response?.tokenInformation &&
      context.data.response?.tokenInformation.instrumentIdentifier.id
    ),
  map: (context: PaymentContext) => {
    const res = <DeepRequired<PtsV2PaymentsPost201Response>>context.data.response;
    webhookSubscriptionRequests(context).catch(error => {
      logger.debug("Webhook subscription : " + error.message);
    });
    return {
      authorizationResponse: {
        token: res.tokenInformation.paymentInstrument.id,
        additionalSavedCardProperties: {
          customerId: res.tokenInformation.customer.id,
          instrumentId: mapInstrumentIdentifier(res)
        }
      }
    };
  }
};

async function webhookSubscriptionRequests(context: PaymentContext) {
  try {
    const res = context.data.response;
    const merchantConfig = <MerchantConfig>context.requestContext.merchantConfig;
    const hostname = nconf.get("atg.server.admin.url");
    if(!res?.processorInformation?.paymentAccountReferenceNumber || !context.requestContext.gatewaySettings?.networkTokenUpdates){
      logger.debug("Webhook Subscription :  Network token not provisioned or Network token updates not enabled");
      return;
    }
    let webhookConfigurations = nconf.get("networkSubscriptionConfigurations") || [];
    logger.debug("Webhook Subscription : Saved Configurations " + JSON.stringify(webhookConfigurations));
    let isConfigurationExists = webhookConfigurations.find((configuration: any) => configuration.merchantId === context.requestContext.merchantConfig.merchantID) || false;
    const webhookurl = hostname + ":" + WEBHOOK_SUBSCRIPTION.PORT + WEBHOOK_SUBSCRIPTION.ENDPOINT;
    let subscriptionDetails: OCC.SubscriptionDetailsResponse | false = await getSubscriptionsDetails(merchantConfig);
    if (!isConfigurationExists && (subscriptionDetails && subscriptionDetails?.webhookId)) {
      logger.debug("Webhook Subscription : Webhook subscription already exists");
      await makeRequest(
        merchantConfig,
        subscribeApi,
        "deleteWebhookSubscription",
        subscriptionDetails.webhookId)
        .then(res => {
          logger.debug("Webhook Subscription : Webhook subscription deleted");
          subscriptionDetails = false;
        })
        .catch(err => {
          logger.debug("Webhook Subscription: Unable to delete subscription");
          logger.debug("Webhook Subscription: " + err.message);
        }); 
    }
    if (isConfigurationExists && !subscriptionDetails) {
      webhookConfigurations = webhookConfigurations.reduce((filtered: any[], credentials: { merchantId: string; }) => {
        if (credentials.merchantId !== merchantConfig.merchantID) {
          filtered.push(credentials);
        }
        return filtered;
      }, []);   
      logger.debug("Webhook Subscription : Removing Configuration from SSE, Not subscribed to ISV webhook");
      isConfigurationExists = false;
    }
    if (!isConfigurationExists && !subscriptionDetails) {
      const keyGenerationResponse = await keyGeneration(merchantConfig);
      const webhookSubscriptionResponse = await webhookSubscription(merchantConfig,context,webhookurl)
      if (keyGenerationResponse?.keyInformation && webhookSubscriptionResponse?.webhookId) {
        const configurationDetails = {
          "merchantId": context.requestContext.merchantConfig.merchantID,
          "key": keyGenerationResponse?.keyInformation.key,
          "keyId": keyGenerationResponse?.keyInformation.keyId,
          "keyExpiration": keyGenerationResponse?.keyInformation.expirationDate,
          "subscriptionId": webhookSubscriptionResponse.webhookId
        };
        webhookConfigurations.push(configurationDetails);
        nconf.set("networkSubscriptionConfigurations", webhookConfigurations);
        nconf.save((err: any) => {
          if (err) {
            logger.debug("Webhook Subscription : Unable to save configuration in SSE " + err.message);
          }
          else {
            logger.debug("Webhook Subscription : Configuration saved successfully");
          }
        })
      }
    }
  } catch (error) {
    logger.debug("Webhook Subscription : " + error.message);
  };
}

