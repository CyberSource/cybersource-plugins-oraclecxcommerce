import { CapturePaymentRequest } from 'cybersource-rest-client';
import { twoDecimal } from './common';
import { APPLICATION_NAME, APPLICATION_VERSION } from '@server-extension/common';

function createCapturePaymentRequest(
  capturePaymentRequest: OCC.CapturePaymentRequest
): CapturePaymentRequest {
  const { merchantReferenceNumber, currency, amount } = capturePaymentRequest;

  return <CapturePaymentRequest>{
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

export default createCapturePaymentRequest;
