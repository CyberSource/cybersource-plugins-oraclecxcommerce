import { PtsV2PaymentsRefundPost201Response } from 'cybersource-rest-client';
import { convertResponse, twelveDigits } from '../common';
import genericCardPayment from '../common/genericCardPayment';
import buildPaymentContext from '@server-extension/services/payments/paymentContextBuilder';
import { Request } from 'express';

export default function createRefundResponse(req: Request, res: any) {
  const context = buildPaymentContext(req);
  const paymentResponse = <DeepRequired<PtsV2PaymentsRefundPost201Response>>context.data.response;

  context.webhookResponse = convertResponse(context, genericCardPayment(context), {
    creditResponse: {
      amount: twelveDigits(paymentResponse.refundAmountDetails.refundAmount)
    }
  });

  Object.assign(res, context.webhookResponse);
}
