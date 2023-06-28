import { PaymentContext } from '@server-extension/common';
import { CreatePaymentRequest } from 'cybersource-rest-client';
import { PaymentRequestMapper } from '../../common';

const isNotPayerAuthValidation = (webhookRequest: OCC.GenericPaymentWebhookRequest) =>
!Boolean(webhookRequest.customProperties?.authenticationTransactionId);


export const payerAuthEnrollMapper: PaymentRequestMapper = {
  supports: (context: PaymentContext) =>
    Boolean(context.requestContext.gatewaySettings.payerAuthEnabled) &&
    isNotPayerAuthValidation(context.webhookRequest),

  map: (context: PaymentContext) => {
    const { webhookRequest } = context;

    return <CreatePaymentRequest>{
      processingInformation: {
        actionList: ['CONSUMER_AUTHENTICATION']
      },
      consumerAuthenticationInformation: {
        requestorId: 'requestorId',
        referenceId: webhookRequest.customProperties?.referenceId,
        returnUrl:webhookRequest.customProperties?.returnUrl,
        deviceChannel:webhookRequest.customProperties?.deviceChannel,
      },
      deviceInformation: {
        httpBrowserJavaEnabled:webhookRequest.customProperties?.httpBrowserJavaEnabled,
        httpAcceptBrowserValue:webhookRequest.customProperties?.httpAcceptBrowserValue,
        httpBrowserLanguage:webhookRequest.customProperties?.httpBrowserLanguage,
        httpBrowserColorDepth:webhookRequest.customProperties?.httpBrowserColorDepth,
        httpBrowserScreenHeight:webhookRequest.customProperties?.httpBrowserScreenHeight,
        httpBrowserScreenWidth:webhookRequest.customProperties?.httpBrowserScreenWidth,
        httpBrowserTimeDifference:webhookRequest.customProperties?.httpBrowserTimeDifference,
        userAgentBrowserValue:webhookRequest.customProperties?.userAgentBrowserValue,
        ipAddress:webhookRequest.customProperties?.ipAddress,
        httpBrowserJavaScriptEnabled:webhookRequest.customProperties?.httpBrowserJavaScriptEnabled,
        httpAcceptContent:webhookRequest.customProperties?.httpAcceptContent
       }
    };
  }
};
