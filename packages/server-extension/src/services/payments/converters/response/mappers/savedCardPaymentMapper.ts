import { PaymentContext } from '@server-extension/common';
import { PtsV2PaymentsPost201Response } from 'cybersource-rest-client';
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
    if (!res?.processorInformation?.paymentAccountReferenceNumber) {
      return;
    }
    if (!context.requestContext.gatewaySettings?.networkTokenEnabled) {
      logger.debug("Webhook Subscription :  Network token option not enabled");
      return;
    }
    let webhookConfigurations = nconf.get("networkSubcriptionConfigurations") || [];
    logger.debug("Webhook Subscription : Saved Configurations " + JSON.stringify(webhookConfigurations));
    let isConfigurationExists = webhookConfigurations.find((configuration: any) => configuration.MerchantID === context.requestContext.merchantConfig.merchantID) || false;
    const hostname = nconf.get('atg.server.admin.url');
    const webhookurl = hostname + WEBHOOK_SUBSCRIPTION.ENDPOINT;
    let subscriptionDetails: OCC.SubscriptionDetailsResponse | false = await getSubscriptionsDetails(context);
    if (!isConfigurationExists && (subscriptionDetails && subscriptionDetails?.webhookId)) {
      logger.debug("Webhook Subscription : Configuration recovered from isv-occ-payment");
      const configurationDetails = {
        "MerchantID": subscriptionDetails.organizationId,
        "SubscriptionID": subscriptionDetails.webhookId
      };
      webhookConfigurations.push(configurationDetails);
      nconf.set("networkSubcriptionConfigurations", webhookConfigurations);
      nconf.save((err: any) => {
        if (err) {
          logger.debug("Webhook Subscription : Configuration not saved in SSE " + err.message);
        }
        else {
          logger.debug("Webhook Subscription : Configuration saved in SSE");
        }
      })
    }
    if (isConfigurationExists && !subscriptionDetails) {
      webhookConfigurations = webhookConfigurations.filter((credentials: any) => credentials.MerchantID !== context.requestContext.merchantConfig.merchantID);
      logger.debug("Webhook Subscription : Configuration removed from SSE");
      isConfigurationExists = false;
    }
    if (!isConfigurationExists && !subscriptionDetails) {
      const keyGenerationPayload = {
        clientRequestAction: "CREATE",
        keyInformation: {
          provider: WEBHOOK_SUBSCRIPTION.PROVIDER,
          tenant: context.requestContext.merchantConfig.merchantID,
          keyType: WEBHOOK_SUBSCRIPTION.KEY_TYPE,
          organizationId: context.requestContext.merchantConfig.merchantID
        }
      };
      const keyGenerationResponse: OCC.keyGenerationResponse = await makeRequest(
        context.requestContext.merchantConfig,
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
        context.requestContext.merchantConfig,
        subscribeApi,
        "webhookSubscription",
        subscriptionPayload
      )
      if (keyGenerationResponse?.keyInformation && webhookSubscriptionResponse?.webhookId) {
        const configurationDetails = {
          "MerchantID": context.requestContext.merchantConfig.merchantID,
          "Key": keyGenerationResponse?.keyInformation.key,
          "KeyID": keyGenerationResponse?.keyInformation.keyId,
          "SubscriptionID": webhookSubscriptionResponse.webhookId
        };
        webhookConfigurations.push(configurationDetails);
        nconf.set("networkSubcriptionConfigurations", webhookConfigurations);
        nconf.save((err: any) => {
          if (err) {
            logger.debug("Webhook Subscription : Configuration not saved in SSE " + err.message);
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

  async function getSubscriptionsDetails(context: PaymentContext): Promise<false | OCC.SubscriptionDetailsResponse> {
    return new Promise(async (resolve) => {
      try {
        const getAllSubscriptions: OCC.SubscriptionDetailsResponse = await makeRequest(
          context.requestContext.merchantConfig,
          subscribeApi,
          "retreiveAllSubscriptions",
          context.requestContext.merchantConfig.merchantID
        )
        logger.debug("Webhook Subscription : " + JSON.stringify(getAllSubscriptions));
        resolve(getAllSubscriptions);
      }
      catch (error) {
        logger.debug("Webhook Subscription : " + error.message);
        resolve(false)
      };
    });
  };
}