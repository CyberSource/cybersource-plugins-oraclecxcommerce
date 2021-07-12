import { PaymentContext } from '@server-extension/common';
import { responseCodeMappings } from '../common';

function apiGenericErrorResponse(err: any, context: PaymentContext) {
  const { webhookRequest } = context;

  context.webhookResponse = <OCC.GenericPaymentWebhookResponse>{
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

export default apiGenericErrorResponse;
