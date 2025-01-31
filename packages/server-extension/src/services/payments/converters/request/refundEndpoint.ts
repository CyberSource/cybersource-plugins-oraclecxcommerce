import { RefundCaptureRequest } from 'cybersource-rest-client';
import { twoDecimal } from './common';
import { APPLICATION_NAME, APPLICATION_VERSION } from '@server-extension/common';

export default function createCreditRequest(data: OCC.RefundPaymentRequest) {
  const { merchantReferenceNumber, currency, amount } = data;

  return <RefundCaptureRequest>{
    clientReferenceInformation: {
      code: merchantReferenceNumber,
      applicationName:APPLICATION_NAME,
      applicationVersion:APPLICATION_VERSION
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
