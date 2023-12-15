import { PaymentContext } from '@server-extension/common';
import { CreatePaymentRequest } from 'cybersource-rest-client';
import { PaymentRequestMapper } from '../../common';
import { cardTypeMappings } from '../common';

export const savedCardPaymentMapper: PaymentRequestMapper = {
  supports: (context: PaymentContext) => {
    return Boolean(context.webhookRequest.cardDetails?.token);
  },

  map: (context: PaymentContext) => {
    const { cardDetails } = context.webhookRequest;
    return <CreatePaymentRequest>{
      paymentInformation: {
        instrumentIdentifier: {
          id: cardDetails.additionalSavedCardProperties?.instrumentId || cardDetails.token
        },
        card: {
          expirationYear: cardDetails.expirationYear,
          expirationMonth: cardDetails.expirationMonth,
          type: cardTypeMappings(cardDetails.type)
        }
      }
    };
  }
};
