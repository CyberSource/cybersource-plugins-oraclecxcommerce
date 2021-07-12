import { PaymentContext } from '@server-extension/common';
import { CreatePaymentRequest } from 'cybersource-rest-client';
import { PaymentRequestMapper } from '../../common';

export const saleMapper: PaymentRequestMapper = {
  supports: (context: PaymentContext) => context.isValidForPaymentMode('saleEnabled'),

  map: () => {
    return <CreatePaymentRequest>{
      processingInformation: {
        capture: true
      }
    };
  }
};
