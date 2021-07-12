import { CapturePaymentRequest } from 'cybersource-rest-client';
import { twoDecimal } from './common';

function createCapturePaymentRequest(
  capturePaymentRequest: OCC.CapturePaymentRequest
): CapturePaymentRequest {
  const { merchantReferenceNumber, currency, amount } = capturePaymentRequest;

  return <CapturePaymentRequest>{
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

export default createCapturePaymentRequest;
