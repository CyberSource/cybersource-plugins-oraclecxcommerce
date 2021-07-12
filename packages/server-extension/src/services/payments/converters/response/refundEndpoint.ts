import { PtsV2PaymentsRefundPost201Response } from 'cybersource-rest-client';
import { responseCodeMappings, twelveDigits } from './common';

export default function createRefundPaymentResponse(
  response: PtsV2PaymentsRefundPost201Response
): OCC.RefundPaymentResponse {
  const refundResponse = <DeepRequired<PtsV2PaymentsRefundPost201Response>>response;

  return {
    hostTransactionTimestamp: refundResponse.submitTimeUtc,
    amount: twelveDigits(refundResponse.refundAmountDetails.refundAmount),
    responseCode: responseCodeMappings(refundResponse.status, '0400'),
    responseReason: refundResponse.status,
    merchantTransactionId: refundResponse.clientReferenceInformation.code,
    hostTransactionId: refundResponse.id,
    merchantTransactionTimestamp: refundResponse.submitTimeUtc
  };
}
