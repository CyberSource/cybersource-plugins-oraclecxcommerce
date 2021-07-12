import { asyncMiddleware, noCache } from '@server-extension/common';
import { NextFunction, Request, Response, Router } from 'express';
import paymentMethods from '../services/payments/paymentMethod/paymentMethodService';

const router = Router();

router.get(
  '/',
  noCache,
  asyncMiddleware(async function (req: Request, res: Response, _next: NextFunction) {
    const { gatewaySettings } = req.app.locals;

    res.json(paymentMethods(gatewaySettings));
  })
);
export default router;
