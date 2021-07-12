import { middleware, PaymentContext } from '@server-extension/common';
import { convertResponse } from '../common';
import genericCardPayment from '../common/genericCardPayment';
import { payerAuthMapper, saleCardMapper, savedCardPaymentMapper } from '../mappers';

function createAuthorizationResponse(context: PaymentContext) {
  context.webhookResponse = convertResponse(
    context,
    genericCardPayment(context),
    payerAuthMapper,
    saleCardMapper,
    savedCardPaymentMapper
  );
}

export default middleware(createAuthorizationResponse);
