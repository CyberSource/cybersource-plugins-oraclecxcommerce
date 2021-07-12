import { middleware, PaymentContext } from '@server-extension/common';
import { PtsV2PaymentsCapturesPost201Response } from 'cybersource-rest-client';
import { convertResponse, twelveDigits } from '../common';
import genericPayment from '../common/genericPayment';

function createCaptureResponse(context: PaymentContext) {
  const paymentResponse = <DeepRequired<PtsV2PaymentsCapturesPost201Response>>context.data.response;

  context.webhookResponse = convertResponse<OCC.GenericWebhookResponse>(
    context,
    genericPayment(context),
    {
      amount: twelveDigits(paymentResponse.orderInformation.amountDetails.totalAmount)
    }
  );
}

export default middleware(createCaptureResponse);
