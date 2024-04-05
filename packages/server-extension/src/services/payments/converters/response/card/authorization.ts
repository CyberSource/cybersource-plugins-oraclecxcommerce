import { convertResponse } from '../common';
import genericCardPayment from '../common/genericCardPayment';
import { payerAuthMapper, saleCardMapper, savedCardPaymentMapper } from '../mappers';
import buildPaymentContext from '@server-extension/services/payments/paymentContextBuilder';
import { Request, Response } from 'express';
import {scaMapper} from '../mappers/scaMapper';

export default function createAuthorizationResponse(req: Request, res: Response) {
  const context = buildPaymentContext(req);
  context.webhookResponse = convertResponse(
    context,
    genericCardPayment(context),
    payerAuthMapper,
    scaMapper,
    saleCardMapper,
    savedCardPaymentMapper
   );
  Object.assign(res, context.webhookResponse);
}
