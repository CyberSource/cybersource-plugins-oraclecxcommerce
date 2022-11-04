// import { PaymentContext } from '@server-extension/common';
// import { CreatePaymentRequest } from 'cybersource-rest-client';
// import { PaymentRequestMapper } from '../../common';

export const genericLineItemsMapper /*: PaymentRequestMapper */ = {
  supports: (context: any) => context.webhookRequest?.items ? true: false,

  map: (context: any /*: PaymentContext */) /* : CreatePaymentRequest */ => {
    const { items = [] } = context.webhookRequest;

    return /* <CreatePaymentRequest> */ {
      orderInformation: {
        lineItems: items.map((item:any)=>{
          return {
            productCode: item?.productId || "",
            productName: item?.displayName || item?.description,
            productSku: item?.catRefId || "",
            quantity: item?.quantity,
            unitPrice: item?.unitPrice || item?.price
          }
        })
      }
    };
  }
};
