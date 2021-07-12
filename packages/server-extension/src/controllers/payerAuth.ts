import { asyncMiddleware, validateRequest } from '@server-extension/common';
import { schema } from '@server-extension/controllers/validation/payerAuthSchema';
import { NextFunction, Request, Response, Router } from 'express';
import generateToken from '../services/payments/payerAuthService';
import { checkSchema } from './validation/common';

const router = Router();

router.post(
  '/generateJwt',
  checkSchema(schema),
  validateRequest,
  asyncMiddleware(async (req: Request, res: Response, _next: NextFunction) => {
    const orderData = <OCC.OrderData>req.body;
    const gatewaySettings = <OCC.GatewaySettings>req.app.locals.gatewaySettings;

    const response = await generateToken(gatewaySettings, orderData);

    res.json({ jwt: response });
  })
);

export default router;
