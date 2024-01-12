import { PaymentContext } from '@server-extension/common';
import { CreatePaymentRequest } from 'cybersource-rest-client';
import { PaymentRequestMapper } from '../../common';
export const lineItemAndSubTotalMapper: PaymentRequestMapper = {
  supports: () => true,
  map: (context: PaymentContext) => {
    const { customProperties } = context.webhookRequest;
    let lineItemDetails = JSON.parse(customProperties?.lineItems);
    return <CreatePaymentRequest>{
      orderInformation: {
        amountDetails: {
          subTotalAmount: customProperties?.subTotal
        },
        lineItems: lineItemDetails
      }
    };
  }
};

