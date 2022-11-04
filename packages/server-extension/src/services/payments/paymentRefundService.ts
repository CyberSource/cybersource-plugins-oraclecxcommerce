import { RequestContext, maskRequestData } from '@server-extension/common';
import {
  MerchantConfig,
  PtsV2PaymentsRefundPost201Response,
  RefundApi,
  RefundPaymentRequest
} from 'cybersource-rest-client';
import makeRequest from './api/paymentCommand';
import createRefundPaymentRequest from './converters/request/refundEndpoint';
import createRefundPaymentResponse from './converters/response/refundEndpoint';
const { LogFactory } = require('@isv-occ-payment/occ-payment-factory');

function executeRefundPayment(
  request: RefundPaymentRequest,
  transactionId: string,
  merchantConfig: MerchantConfig
) {
  const logger = LogFactory.logger();
  logger.debug(`Refund API Request: ${JSON.stringify(maskRequestData(request))}`);

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
