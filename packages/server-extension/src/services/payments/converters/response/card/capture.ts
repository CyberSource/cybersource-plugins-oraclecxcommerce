import { middleware, PaymentContext } from '@server-extension/common';
import { PtsV2PaymentsCapturesPost201Response } from 'cybersource-rest-client';
import { convertResponse, twelveDigits } from '../common';
import genericCardPayment from '../common/genericCardPayment';

function createCaptureResponse(context: PaymentContext) {
  const paymentResponse = <DeepRequired<PtsV2PaymentsCapturesPost201Response>>context.data.response;

  context.webhookResponse = convertResponse(context, genericCardPayment(context), {
    captureResponse: {
      amount: twelveDigits(paymentResponse.orderInformation.amountDetails.totalAmount)
    }
  });
}

export default middleware(createCaptureResponse);
