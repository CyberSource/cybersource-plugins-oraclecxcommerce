import { middleware, PaymentContext } from '@server-extension/common';
import { CapturePaymentRequest } from 'cybersource-rest-client';
import { convertRequest, twoDecimal } from './common';

function createCaptureRequest(context: PaymentContext) {
  const { webhookRequest } = context;

  context.data.request = convertRequest<CapturePaymentRequest>(context, {
    clientReferenceInformation: {
      code: webhookRequest.orderId
    },
    orderInformation: {
      amountDetails: {
        totalAmount: twoDecimal(webhookRequest.amount),
        currency: webhookRequest.currencyCode
      }
    }
  });

  context.data.transactionId =
    webhookRequest.referenceInfo && webhookRequest.referenceInfo.hostTransactionId;
}

export default middleware(createCaptureRequest);
