import { Next, PaymentContext } from '@server-extension/common';
import { PaymentsApi, PtsV2PaymentsPost201Response } from 'cybersource-rest-client';
import makeRequest from './paymentCommand';

export default async function makePaymentRequest(context: PaymentContext, next: Next) {
  const { request } = context.data;
  const { merchantConfig } = context.requestContext;

  context.data.response = await makeRequest<PtsV2PaymentsPost201Response>(
    merchantConfig,
    PaymentsApi,
    'createPayment',
    request
  );

  next();
}
