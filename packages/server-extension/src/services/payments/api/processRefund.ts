import { Next, PaymentContext } from '@server-extension/common';
import { PtsV2PaymentsRefundPost201Response, RefundApi } from 'cybersource-rest-client';
import makeRequest from './paymentCommand';

export default async function makeRefundRequest(context: PaymentContext, next: Next) {
  const { request, transactionId } = context.data;
  const { merchantConfig } = context.requestContext;

  context.data.response = await makeRequest<PtsV2PaymentsRefundPost201Response>(
    merchantConfig,
    RefundApi,
    'refundCapture',
    request,
    transactionId
  );

  next();
}
