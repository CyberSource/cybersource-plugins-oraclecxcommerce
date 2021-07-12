import { middleware, PaymentContext } from '@server-extension/common';
import { RefundCaptureRequest } from 'cybersource-rest-client';
import { convertRequest, twoDecimal } from './common';

function createCreditRequest(context: PaymentContext) {
  const { webhookRequest } = context;

  context.data.request = convertRequest<RefundCaptureRequest>(context, {
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

export default middleware(createCreditRequest);
