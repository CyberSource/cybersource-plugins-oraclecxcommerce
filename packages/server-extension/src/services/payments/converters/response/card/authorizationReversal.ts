import { middleware, PaymentContext } from '@server-extension/common';
import { PtsV2PaymentsReversalsPost201Response } from 'cybersource-rest-client';
import { convertResponse, twelveDigits } from '../common';
import genericCardPayment from '../common/genericCardPayment';

function createAuthorizationReversalResponse(context: PaymentContext) {
  const paymentResponse = <DeepRequired<PtsV2PaymentsReversalsPost201Response>>(
    context.data.response
  );

  context.webhookResponse = convertResponse(context, genericCardPayment(context), {
    voidResponse: {
      amount: twelveDigits(paymentResponse.reversalAmountDetails.reversedAmount)
    }
  });
}

export default middleware(createAuthorizationReversalResponse);
