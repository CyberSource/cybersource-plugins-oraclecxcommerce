import { AuthReversalRequest } from 'cybersource-rest-client';
import { convertRequest, twoDecimal } from './common';
import buildPaymentContext from '@server-extension/services/payments/paymentContextBuilder';
import { Request, Response } from 'express';

export default function createAuthorizationReversalRequest(req: Request, res: Response) {
  const context = buildPaymentContext(req);
  const { webhookRequest } = context;

  context.data.request = convertRequest<AuthReversalRequest>(context, {
    clientReferenceInformation: {
      code: webhookRequest.orderId
    },
    reversalInformation: {
      amountDetails: {
        totalAmount: twoDecimal(webhookRequest.amount),
        currency: webhookRequest.currencyCode
      }
    }
  });

  context.data.transactionId =
    webhookRequest.referenceInfo && webhookRequest.referenceInfo.hostTransactionId;
}
