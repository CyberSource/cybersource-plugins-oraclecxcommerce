import { PaymentContext } from '@server-extension/common';
import jwtService from '@server-extension/services/jwtService';
import { CreatePaymentRequest } from 'cybersource-rest-client';
import { PaymentRequestMapper } from '../../common';

export const payerAuthValidationMapper: PaymentRequestMapper = {
  supports: (context: PaymentContext) => Boolean(context.webhookRequest.customProperties?.authJwt),

  map: (context: PaymentContext) => {
    const { webhookRequest } = context;

    return <CreatePaymentRequest>{
      processingInformation: {
        actionList: ['VALIDATE_CONSUMER_AUTHENTICATION']
      },
      consumerAuthenticationInformation: {
        authenticationTransactionId: getAuthenticationTransactionId(
          webhookRequest.customProperties!.authJwt!
        )
      }
    };
  }
};

function getAuthenticationTransactionId(authJwt: string) {
  const decoded = jwtService.decode(authJwt);
  return decoded.payload.Payload.Payment.ProcessorTransactionId;
}
