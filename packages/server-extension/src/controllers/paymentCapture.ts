import { asyncMiddleware, RequestContext, validateRequest } from '@server-extension/common';
import { capturePayment } from '@server-extension/services/payments/paymentCaptureService';
import { NextFunction, Request, Response, Router } from 'express';
import { checkSchema } from 'express-validator';
import { schema } from './validation/capturePaymentSchema';

const router = Router();

router.post(
  '/',
  checkSchema(schema),
  validateRequest,
  asyncMiddleware(async (req: Request, res: Response, _next: NextFunction) => {
    const captureRequest = <OCC.CapturePaymentRequest>req.body;
    const requestContext = <RequestContext>req.app.locals;

    const captureResponse = await capturePayment(captureRequest, requestContext);
    res.json(captureResponse);
  })
);

export default router;
