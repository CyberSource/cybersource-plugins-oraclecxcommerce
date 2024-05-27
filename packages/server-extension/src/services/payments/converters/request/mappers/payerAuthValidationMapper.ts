import { PaymentContext } from '@server-extension/common';
import { CreatePaymentRequest } from 'cybersource-rest-client';
import { PaymentRequestMapper } from '../../common';


const getPauseRequestId = (context: PaymentContext) => {
  const pauseRequestId = context.webhookRequest.customProperties?.pauseRequestId;
  return  pauseRequestId ? {clientReferenceInformation :{ pausedRequestId : pauseRequestId}} : {};
}

export const payerAuthValidationMapper: PaymentRequestMapper = {
  supports: (context: PaymentContext) => Boolean(context.webhookRequest.customProperties?.authenticationTransactionId),

  map: (context: PaymentContext) => {
    const { webhookRequest } = context;
    return <CreatePaymentRequest>{
      processingInformation: {
        actionList: ['VALIDATE_CONSUMER_AUTHENTICATION']
      },
      consumerAuthenticationInformation: {
        authenticationTransactionId: webhookRequest.customProperties!.authenticationTransactionId
      },
      ...getPauseRequestId(context)
    };
  }
};


