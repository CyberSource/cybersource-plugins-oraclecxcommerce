import { RequestContext, maskRequestData } from '@server-extension/common';
import {
  CaptureApi,
  CapturePaymentRequest,
  MerchantConfig,
  PtsV2PaymentsCapturesPost201Response
} from 'cybersource-rest-client';
import makeRequest from './api/paymentCommand';
import createCapturePaymentRequest from './converters/request/captureEndpoint';
import createCapturePaymentResponse from './converters/response/captureEndpoint';
const { LogFactory } = require('@isv-occ-payment/occ-payment-factory');

function executeCapturePayment(
  request: CapturePaymentRequest,
  hostTransactionId: string,
  merchantConfig: MerchantConfig
) {
  const logger = LogFactory.logger();
  logger.debug(`Capture API Request: ${JSON.stringify(maskRequestData(request))}`);

  return makeRequest<PtsV2PaymentsCapturesPost201Response>(
    merchantConfig,
    CaptureApi,
    'capturePayment',
    request,
    hostTransactionId
  );
}

export async function capturePayment(
  capturePayload: OCC.CapturePaymentRequest,
  requestContext: RequestContext
): Promise<OCC.CapturePaymentResponse> {
  const captureRequest = createCapturePaymentRequest(capturePayload);

  const captureResponse = await executeCapturePayment(
    captureRequest,
    capturePayload.transactionId,
    requestContext.merchantConfig
  );

  return createCapturePaymentResponse(captureResponse);
}
