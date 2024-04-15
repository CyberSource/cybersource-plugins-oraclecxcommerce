import { PaymentContext } from '@server-extension/common';
import { CreatePaymentRequest } from 'cybersource-rest-client';
import { PaymentRequestMapper } from '../../common';
export const lineItemAndSubTotalMapper: PaymentRequestMapper = {
  supports: () => true,
  map: (context: PaymentContext) => {
    const { customProperties } = context.webhookRequest;
    const lineItems = customProperties?.lineItems || null; 
    const lineItemDetails = JSON.parse(lineItems);
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

