import { middleware, PaymentContext } from '@server-extension/common';
import { PtsV2PaymentsReversalsPost201Response } from 'cybersource-rest-client';
import { convertResponse, twelveDigits } from '../common';
import genericPayment from '../common/genericPayment';

function createAuthorizationReversalResponse(context: PaymentContext) {
  const paymentResponse = <DeepRequired<PtsV2PaymentsReversalsPost201Response>>(
    context.data.response
  );

  context.webhookResponse = convertResponse<OCC.GenericWebhookResponse>(
    context,
    genericPayment(context),
    {
      amount: twelveDigits(paymentResponse.reversalAmountDetails.reversedAmount)
    }
  );
}

export default middleware(createAuthorizationReversalResponse);
