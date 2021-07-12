import { Next, PaymentContext } from '@server-extension/common';
import { CaptureApi, PtsV2PaymentsCapturesPost201Response } from 'cybersource-rest-client';
import makeRequest from './paymentCommand';

export default async function makePaymentRequest(context: PaymentContext, next: Next) {
  const { request, transactionId } = context.data;
  const { merchantConfig } = context.requestContext;

  context.data.response = await makeRequest<PtsV2PaymentsCapturesPost201Response>(
    merchantConfig,
    CaptureApi,
    'capturePayment',
    request,
    transactionId
  );

  next();
}
