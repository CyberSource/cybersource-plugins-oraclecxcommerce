import { PaymentContext } from '@server-extension/common';
import { CreatePaymentRequest } from 'cybersource-rest-client';
import { PaymentRequestMapper } from '../../common';

export const savePaymentTokenMapper: PaymentRequestMapper = {
  supports: (context: PaymentContext) => {
    return Boolean(context.webhookRequest.cardDetails?.saveCard);
  },

  map: () => {
    return <CreatePaymentRequest>{
      processingInformation: {
        actionList: ['TOKEN_CREATE'],
        actionTokenTypes: ['customer', 'paymentInstrument', 'shippingAddress']
      }
    };
  }
};
