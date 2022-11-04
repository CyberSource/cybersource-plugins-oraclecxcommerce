import { convertResponse } from '../common';
import genericPayment from '../common/genericPayment';
import { saleGenericMapper } from '../mappers';
import buildPaymentContext from '@server-extension/services/payments/paymentContextBuilder';
import { Request, Response } from 'express';

export default function createAuthorizationResponse(req: Request, res: Response) {
  const context = buildPaymentContext(req);
  context.webhookResponse = convertResponse<OCC.GenericWebhookResponse>(
    context,
    genericPayment(context),
    saleGenericMapper
  );

  Object.assign(res, context.webhookResponse);
}
