import { PtsV2PaymentsCapturesPost201Response } from 'cybersource-rest-client';
import { convertResponse, twelveDigits } from '../common';
import genericCardPayment from '../common/genericCardPayment';
import buildPaymentContext from '@server-extension/services/payments/paymentContextBuilder';
import { Request, Response } from 'express';

export default function createCaptureResponse(req: Request, res: Response) {
  const context = buildPaymentContext(req);
  const paymentResponse = <DeepRequired<PtsV2PaymentsCapturesPost201Response>>context.data.response;

  context.webhookResponse = convertResponse(context, genericCardPayment(context), {
    captureResponse: {
      amount: twelveDigits(paymentResponse.orderInformation.amountDetails.totalAmount)
    }
  });

  Object.assign(res, context.webhookResponse);
}
