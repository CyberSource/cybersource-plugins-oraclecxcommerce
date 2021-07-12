import { middleware, PaymentContext } from '@server-extension/common';
import { PtsV2PaymentsRefundPost201Response } from 'cybersource-rest-client';
import { convertResponse, twelveDigits } from '../common';
import genericPayment from '../common/genericPayment';

function createRefundResponse(context: PaymentContext) {
  const paymentResponse = <DeepRequired<PtsV2PaymentsRefundPost201Response>>context.data.response;

  context.webhookResponse = convertResponse<OCC.GenericWebhookResponse>(
    context,
    genericPayment(context),
    {
      amount: twelveDigits(paymentResponse.refundAmountDetails.refundAmount)
    }
  );
}

export default middleware(createRefundResponse);
