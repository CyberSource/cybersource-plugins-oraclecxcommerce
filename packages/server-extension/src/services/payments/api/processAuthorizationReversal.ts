import { Next, PaymentContext } from '@server-extension/common';
import { PtsV2PaymentsReversalsPost201Response, ReversalApi } from 'cybersource-rest-client';
import makeRequest from './paymentCommand';

export default async function makeAuthReversalRequest(context: PaymentContext, next: Next) {
  const { request, transactionId } = context.data;
  const { merchantConfig } = context.requestContext;

  context.data.response = await makeRequest<PtsV2PaymentsReversalsPost201Response>(
    merchantConfig,
    ReversalApi,
    'authReversal',
    transactionId,
    request
  );

  next();
}
