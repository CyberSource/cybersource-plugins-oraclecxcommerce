import { asyncMiddleware, noCache } from '@server-extension/common';
import { NextFunction, Request, Response, Router } from 'express';
import paymentMethods from '../services/payments/paymentMethod/paymentMethodService';
const { LogFactory } = require('@isv-occ-payment/occ-payment-factory');
const router = Router();
const logger = LogFactory.logger();
router.get(
  '/',
  noCache,
  asyncMiddleware(async function (req: Request, res: Response, _next: NextFunction) {
    const { gatewaySettings } = req.app.locals;
    const settings = paymentMethods(gatewaySettings);
    logger.debug(`Payment method webhook response: ${JSON.stringify(settings)}`);
    res.json(settings);   
  })
);
export default router;
