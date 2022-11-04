import { CaptureApi, PtsV2PaymentsCapturesPost201Response } from 'cybersource-rest-client';
import makeRequest from './paymentCommand';
import buildPaymentContext from '@server-extension/services/payments/paymentContextBuilder';
import { Request, Response } from 'express';
import { maskRequestData } from '@server-extension/common';
const { LogFactory } = require('@isv-occ-payment/occ-payment-factory');

export default async function makePaymentRequest(req: Request, res: Response) {
  const context = buildPaymentContext(req);
  const { request, transactionId } = context.data;
  const { merchantConfig } = context.requestContext;
  const logger = LogFactory.logger();
  logger.debug(`Capture API Request: ${JSON.stringify(maskRequestData(request))}`);

  context.data.response = await makeRequest<PtsV2PaymentsCapturesPost201Response>(
    merchantConfig,
    CaptureApi,
    'capturePayment',
    request,
    transactionId
  );
}
