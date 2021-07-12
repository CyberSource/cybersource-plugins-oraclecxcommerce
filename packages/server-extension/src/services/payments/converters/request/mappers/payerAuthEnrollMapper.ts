import { PaymentContext } from '@server-extension/common';
import { CreatePaymentRequest } from 'cybersource-rest-client';
import { PaymentRequestMapper } from '../../common';

const isNotPayerAuthValidation = (webhookRequest: OCC.GenericPaymentWebhookRequest) =>
  !Boolean(webhookRequest.customProperties?.authJwt);

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
        referenceId: webhookRequest.customProperties?.referenceId
      }
    };
  }
};
