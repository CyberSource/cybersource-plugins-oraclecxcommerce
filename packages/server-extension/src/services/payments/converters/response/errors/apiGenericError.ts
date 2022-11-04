import { responseCodeMappings } from '../common';
import { Request } from 'express';

export function apiGenericErrorResponse(err: any, req: Request) {
  const webhookRequest = req.body;

  return <OCC.GenericPaymentWebhookResponse>{
    orderId: webhookRequest.orderId,
    channel: webhookRequest.channel,
    locale: webhookRequest.locale,
    transactionType: webhookRequest.transactionType,
    currencyCode: webhookRequest.currencyCode,
    amount: webhookRequest.amount,

    paymentId: webhookRequest.paymentId,
    merchantTransactionId: webhookRequest.transactionId,

    response: {
      code: responseCodeMappings('DECLINED', webhookRequest.transactionType),
      reason: 'DECLINED',
      responseDescription: err.message,
      success: false
    }
  };
}
