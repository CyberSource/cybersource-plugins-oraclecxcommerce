import { middleware, PaymentContext } from '@server-extension/common';
import { convertResponse } from '../common';
import genericPayment from '../common/genericPayment';
import { saleGenericMapper } from '../mappers';

function createAuthorizationResponse(context: PaymentContext) {
  context.webhookResponse = convertResponse<OCC.GenericWebhookResponse>(
    context,
    genericPayment(context),
    saleGenericMapper
  );
}

export default middleware(createAuthorizationResponse);
