import { PtsV2PaymentsRefundPost201Response } from 'cybersource-rest-client';
import { convertResponse, twelveDigits } from '../common';
import genericPayment from '../common/genericPayment';
import buildPaymentContext from '@server-extension/services/payments/paymentContextBuilder';
import { Request, Response } from 'express';

export default function createRefundResponse(req: Request, res: Response) {
  const context = buildPaymentContext(req, res);
  const paymentResponse = <DeepRequired<PtsV2PaymentsRefundPost201Response>>context.data.response;

  context.webhookResponse = convertResponse<OCC.GenericWebhookResponse>(
    context,
    genericPayment(context),
    {
      amount: twelveDigits(paymentResponse.refundAmountDetails.refundAmount)
    }
  );
  res.locals.data = context.webhookResponse;
}
