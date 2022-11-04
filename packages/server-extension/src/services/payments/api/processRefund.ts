import { PtsV2PaymentsRefundPost201Response, RefundApi } from 'cybersource-rest-client';
import makeRequest from './paymentCommand';
import buildPaymentContext from '@server-extension/services/payments/paymentContextBuilder';
import { Request, Response } from 'express';
const { LogFactory } = require('@isv-occ-payment/occ-payment-factory');
import { maskRequestData } from '@server-extension/common';

export default async function makeRefundRequest(req: Request, res: Response) {
  const context = buildPaymentContext(req);
  const { request, transactionId } = context.data;
  const { merchantConfig } = context.requestContext;
  const logger = LogFactory.logger();
  logger.debug(`Refund API Request: ${JSON.stringify(maskRequestData(request))}`);

  context.data.response = await makeRequest<PtsV2PaymentsRefundPost201Response>(
    merchantConfig,
    RefundApi,
    'refundCapture',
    request,
    transactionId
  );
}
