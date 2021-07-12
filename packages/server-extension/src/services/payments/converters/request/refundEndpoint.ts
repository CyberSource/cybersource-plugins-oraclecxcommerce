import { RefundCaptureRequest } from 'cybersource-rest-client';
import { twoDecimal } from './common';

export default function createCreditRequest(data: OCC.RefundPaymentRequest) {
  const { merchantReferenceNumber, currency, amount } = data;

  return <RefundCaptureRequest>{
    clientReferenceInformation: {
      code: merchantReferenceNumber
    },
    processingInformation: {
      commerceIndicator: 'internet'
    },
    orderInformation: {
      amountDetails: {
        totalAmount: twoDecimal(amount),
        currency: currency
      }
    }
  };
}
