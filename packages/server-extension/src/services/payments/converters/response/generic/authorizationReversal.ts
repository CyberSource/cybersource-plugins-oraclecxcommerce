import { PtsV2PaymentsReversalsPost201Response } from 'cybersource-rest-client';
import { convertResponse, twelveDigits } from '../common';
import genericPayment from '../common/genericPayment';
import buildPaymentContext from '@server-extension/services/payments/paymentContextBuilder';
import { Request, Response } from 'express';

export default function createAuthorizationReversalResponse(req: Request, res: Response) {
  const context = buildPaymentContext(req);
  const paymentResponse = <DeepRequired<PtsV2PaymentsReversalsPost201Response>>(
    context.data.response
  );
  if(!paymentResponse?.reversalAmountDetails?.reversedAmount){
    return;
  }
  context.webhookResponse = convertResponse<OCC.GenericWebhookResponse>(
    context,
    genericPayment(context),
    {
      amount: twelveDigits(paymentResponse.reversalAmountDetails.reversedAmount)
    }
  );

  Object.assign(res, context.webhookResponse);
}
