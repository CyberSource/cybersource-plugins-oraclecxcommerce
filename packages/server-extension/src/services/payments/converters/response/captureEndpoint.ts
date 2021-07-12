import { PtsV2PaymentsCapturesPost201Response } from 'cybersource-rest-client';
import { responseCodeMappings, twelveDigits } from './common';

function createCapturePaymentResponse(
  response: PtsV2PaymentsCapturesPost201Response
): OCC.CapturePaymentResponse {
  const captureResponse = <DeepRequired<PtsV2PaymentsCapturesPost201Response>>response;

  return {
    hostTransactionTimestamp: captureResponse.submitTimeUtc,
    amount: twelveDigits(captureResponse.orderInformation.amountDetails.totalAmount),
    hostTransactionId: captureResponse.id,
    merchantTransactionId: captureResponse.clientReferenceInformation?.code,
    responseCode: responseCodeMappings(captureResponse.status, '0200'),
    responseReason: captureResponse.status,
    merchantTransactionTimestamp: new Date().toISOString()
  };
}

export default createCapturePaymentResponse;
