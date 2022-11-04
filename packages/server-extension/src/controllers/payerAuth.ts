import { asyncMiddleware, validateRequest } from '@server-extension/common';
import { schema } from '@server-extension/controllers/validation/payerAuthSchema';
import { NextFunction, Request, Response, Router } from 'express';
import generateToken from '../services/payments/payerAuthService';
import { checkSchema } from './validation/common';
const { LogFactory } = require('@isv-occ-payment/occ-payment-factory');
const router = Router();
const logger = LogFactory.logger();
router.post(
  '/generateJwt',
  checkSchema(schema),
  validateRequest,
  asyncMiddleware(async (req: Request, res: Response, _next: NextFunction) => {
    const orderData = <OCC.OrderData>req.body;
    const gatewaySettings = <OCC.GatewaySettings>req.app.locals.gatewaySettings;

    const response = await generateToken(gatewaySettings, orderData);
    logger.debug(`JWT webhook response: ${response}`);
    res.json({ jwt: response });
  })
);

export default router;
