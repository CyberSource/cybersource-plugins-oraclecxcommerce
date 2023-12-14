import { PaymentContext } from '@server-extension/common';
import { MerchantConfig, PtsV2PaymentsPost201Response } from 'cybersource-rest-client';
import { PaymentResponseMapper } from '../../common';
import nconf from 'nconf';
import makeRequest from '@server-extension/services/payments/api/paymentCommand';

const { LogFactory } = require('@isv-occ-payment/occ-payment-factory');
const logger = LogFactory.logger();
const subscribeApi = require('../subscribeApi');
import { WEBHOOK_SUBSCRIPTION } from '../common';

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
    if (!res?.processorInformation?.paymentAccountReferenceNumber) {
      return;
    }
    if (!context.requestContext.gatewaySettings?.networkTokenUpdates) {
      logger.debug("Webhook Subscription :  Network token option not enabled");
      return;
    }
    let webhookConfigurations = nconf.get("networkSubcriptionConfigurations") || [];
    logger.debug("Webhook Subscription : Saved Configurations " + JSON.stringify(webhookConfigurations));
    let isConfigurationExists = webhookConfigurations.find((configuration: any) => configuration.merchantId === context.requestContext.merchantConfig.merchantID) || false;
    const hostname = nconf.get("atg.server.admin.url");
    const webhookurl = hostname + ":" + WEBHOOK_SUBSCRIPTION.PORT + WEBHOOK_SUBSCRIPTION.ENDPOINT;
    let subscriptionDetails: OCC.SubscriptionDetailsResponse | false = await getSubscriptionsDetails(merchantConfig);
    if (!isConfigurationExists && (subscriptionDetails && subscriptionDetails?.webhookId)) {
      logger.debug("Webhook Subscription : Webhook already subscribed:Unable to find webhook configuration in SSE");
      await makeRequest(
        merchantConfig,
        subscribeApi,
        "deleteWebhookSubscription",
        subscriptionDetails.webhookId)
        .then(res => {
          logger.debug("Webhook Subscription : Webhook subscription deleted");
        })
        .catch(err => {
          logger.debug("Webhook Subscription: Unable to delete subscription");
          logger.debug("Webhook Subscription: " + err.message);
        });
      subscriptionDetails = false;
    }
    if (isConfigurationExists && !subscriptionDetails) {
      webhookConfigurations = webhookConfigurations.filter((credentials: any) => credentials.merchantId !== merchantConfig.merchantID);
      logger.debug("Webhook Subscription : Removing Configuration from SSE, Not subscribed to ISV webhook");
      isConfigurationExists = false;
    }
    if (!isConfigurationExists && !subscriptionDetails) {
      const keyGenerationPayload = {
        clientRequestAction: "CREATE",
        keyInformation: {
          provider: WEBHOOK_SUBSCRIPTION.PROVIDER,
          tenant: merchantConfig.merchantID,
          keyType: WEBHOOK_SUBSCRIPTION.KEY_TYPE,
          organizationId: merchantConfig.merchantID
        }
      };
      logger.debug("Webhook Subscription : Calling Key Generation API");
      const keyGenerationResponse: OCC.keyGenerationResponse = await makeRequest(
        merchantConfig,
        subscribeApi,
        "keyGeneration",
        keyGenerationPayload
      )
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
      const webhookSubscriptionResponse: OCC.webhookSubscriptionResponse = await makeRequest(
        merchantConfig,
        subscribeApi,
        "webhookSubscription",
        subscriptionPayload
      )
      if (keyGenerationResponse?.keyInformation && webhookSubscriptionResponse?.webhookId) {
        const configurationDetails = {
          "merchantId": context.requestContext.merchantConfig.merchantID,
          "key": keyGenerationResponse?.keyInformation.key,
          "keyId": keyGenerationResponse?.keyInformation.keyId,
          "keyExpiration": keyGenerationResponse?.keyInformation.expirationDate,
          "subscriptionId": webhookSubscriptionResponse.webhookId
        };
        webhookConfigurations.push(configurationDetails);
        nconf.set("networkSubcriptionConfigurations", webhookConfigurations);
        nconf.save((err: any) => {
          if (err) {
            logger.debug("Webhook Subscription : Unable to save configuration in SSE " + err.message);
          }
          else {
            logger.debug("Webhook Subscription : Configuration saved in SSE");
          }
        })
      }
    }
  } catch (error) {
    logger.debug("Webhook Subscription : " + error.message);
  };

  async function getSubscriptionsDetails(merchantConfig: MerchantConfig): Promise<false | OCC.SubscriptionDetailsResponse> {
    return new Promise(async (resolve) => {
      try {
        const getAllSubscriptions: OCC.SubscriptionDetailsResponse = await makeRequest(
          merchantConfig,
          subscribeApi,
          "retreiveAllSubscriptions",
          merchantConfig.merchantID
        )
        resolve(getAllSubscriptions);
      }
      catch (error) {
        logger.debug("Webhook Subscription : " + error.message);
        logger.debug("Webhook Subscription : Not subscribed to ISV webhook");
        resolve(false)
      };
    });
  };
}