import { RequestContext } from '@server-extension/common';
import {
  MerchantConfig,
  PtsV2PaymentsRefundPost201Response,
  RefundApi,
  RefundPaymentRequest
} from 'cybersource-rest-client';
import makeRequest from './api/paymentCommand';
import createRefundPaymentRequest from './converters/request/refundEndpoint';
import createRefundPaymentResponse from './converters/response/refundEndpoint';

function executeRefundPayment(
  request: RefundPaymentRequest,
  transactionId: string,
  merchantConfig: MerchantConfig
) {
  return makeRequest<PtsV2PaymentsRefundPost201Response>(
    merchantConfig,
    RefundApi,
    'refundCapture',
    request,
    transactionId
  );
}

export default async function refundPayment(
  refundPayload: OCC.RefundPaymentRequest,
  requestContext: RequestContext
): Promise<OCC.RefundPaymentResponse> {
  const refundRequest = createRefundPaymentRequest(refundPayload);

  const refundResponse = await executeRefundPayment(
    refundRequest,
    refundPayload.transactionId,
    requestContext.merchantConfig
  );
  return createRefundPaymentResponse(refundResponse);
}
