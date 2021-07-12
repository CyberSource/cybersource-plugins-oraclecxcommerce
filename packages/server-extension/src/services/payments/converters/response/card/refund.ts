import { middleware, PaymentContext } from '@server-extension/common';
import { PtsV2PaymentsRefundPost201Response } from 'cybersource-rest-client';
import { convertResponse, twelveDigits } from '../common';
import genericCardPayment from '../common/genericCardPayment';

function createRefundResponse(context: PaymentContext) {
  const paymentResponse = <DeepRequired<PtsV2PaymentsRefundPost201Response>>context.data.response;

  context.webhookResponse = convertResponse(context, genericCardPayment(context), {
    creditResponse: {
      amount: twelveDigits(paymentResponse.refundAmountDetails.refundAmount)
    }
  });
}

export default middleware(createRefundResponse);
