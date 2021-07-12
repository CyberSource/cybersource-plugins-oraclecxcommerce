import { middleware, PaymentContext } from '@server-extension/common';
import { AuthReversalRequest } from 'cybersource-rest-client';
import { convertRequest, twoDecimal } from './common';

function createAuthorizationReversalRequest(context: PaymentContext) {
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

export default middleware(createAuthorizationReversalRequest);
