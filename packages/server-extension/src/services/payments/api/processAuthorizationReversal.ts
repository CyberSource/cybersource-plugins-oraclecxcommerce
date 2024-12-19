import { PtsV2PaymentsReversalsPost201Response, ReversalApi } from 'cybersource-rest-client';
import makeRequest from './paymentCommand';
import buildPaymentContext from '@server-extension/services/payments/paymentContextBuilder';
import { Request, Response } from 'express';
import { maskRequestData } from '@server-extension/common';
const { LogFactory } = require('@isv-occ-payment/occ-payment-factory');
const logger = LogFactory.logger();

export default async function makeAuthReversalRequest(req: Request, res: Response) {
  const context = buildPaymentContext(req);

  if(!context?.data?.transactionId){
    return;
  }
  
  const { request, transactionId } = context.data;
  const { merchantConfig } = context.requestContext;

  logger.debug(`AuthReversal API Request: ${JSON.stringify(maskRequestData(request))}`);
  
  context.data.response = await makeRequest<PtsV2PaymentsReversalsPost201Response>(
    merchantConfig,
    ReversalApi,
    'authReversal',
    transactionId,
    request
  );
}
