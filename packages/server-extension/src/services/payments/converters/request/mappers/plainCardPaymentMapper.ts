import { PaymentContext } from '@server-extension/common';
import { CreatePaymentRequest } from 'cybersource-rest-client';
import { PaymentRequestMapper } from '../../common';
import { cardTypeMappings } from '../common';

export const plainCardPaymentMapper: PaymentRequestMapper = {
  supports: (context: PaymentContext) => {
    const { webhookRequest } = context;

    return Boolean(
      webhookRequest.cardDetails &&
        !webhookRequest.customProperties?.transientTokenJwt &&
        !webhookRequest.cardDetails?.token
    );
  },

  map: (context: PaymentContext) => {
    const { cardDetails } = context.webhookRequest;

    return <CreatePaymentRequest>{
      paymentInformation: {
        card: {
          expirationYear: cardDetails.expirationYear,
          expirationMonth: cardDetails.expirationMonth,
          number: cardDetails.number,
          securityCode: cardDetails.cvv,
          type: cardTypeMappings(cardDetails.type)
        }
      }
    };
  }
};
