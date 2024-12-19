import { PaymentsApi, PtsV2PaymentsPost201Response } from 'cybersource-rest-client';
import makeRequest from './paymentCommand';
import { Request, Response } from 'express';
import buildPaymentContext from '@server-extension/services/payments/paymentContextBuilder';
import { maskRequestData } from '@server-extension/common';
const { LogFactory } = require('@isv-occ-payment/occ-payment-factory');

export default async function makePaymentRequest(req: Request, res: Response) {
  const context = buildPaymentContext(req);
  const { request } = context.data;
  const { merchantConfig } = context.requestContext;
  const logger = LogFactory.logger();
  const isMessageLevelEncryptionEnabled = context?.requestContext.gatewaySettings?.messageEncryptionEnabled;
  if('Yes'=== isMessageLevelEncryptionEnabled){
    merchantConfig.useMLEGlobally = true;
  }
  logger.debug(`Payment API Request: ${JSON.stringify(maskRequestData(request))}`)
  context.data.response = await makeRequest<PtsV2PaymentsPost201Response>(
    merchantConfig,
    PaymentsApi,
    'createPayment',
    request
  );
}
