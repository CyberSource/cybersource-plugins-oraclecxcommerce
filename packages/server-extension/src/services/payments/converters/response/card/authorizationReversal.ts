import { PtsV2PaymentsReversalsPost201Response } from 'cybersource-rest-client';
import { convertResponse, twelveDigits } from '../common';
import genericCardPayment from '../common/genericCardPayment';
import buildPaymentContext from '@server-extension/services/payments/paymentContextBuilder';
import { Request, Response } from 'express';

export default function createAuthorizationReversalResponse(req: Request, res: Response) {
  const context = buildPaymentContext(req);
  const paymentResponse = <DeepRequired<PtsV2PaymentsReversalsPost201Response>>(
    context.data.response
  );

  context.webhookResponse = convertResponse(context, genericCardPayment(context), {
    voidResponse: {
      amount: twelveDigits(paymentResponse.reversalAmountDetails.reversedAmount)
    }
  });
  Object.assign(res, context.webhookResponse);
}
