import { asyncMiddleware, RequestContext, validateRequest } from '@server-extension/common';
import { NextFunction, Request, Response, Router } from 'express';
import { checkSchema } from 'express-validator';
import { createCaptureContext } from '../services/payments/flexService';
import { schema } from './validation/flexCaptureContextSchema';

const router = Router();

router.post(
  '/',
  checkSchema(schema),
  validateRequest,
  asyncMiddleware(async function (req: Request, res: Response, _next: NextFunction) {
    const captureContextPayload = <OCC.CaptureContextRequest>req.body;
    const requestContext = <RequestContext>req.app.locals;

    const captureContext: OCC.CaptureContextResponse = await createCaptureContext(
      requestContext,
      captureContextPayload
    );

    res.json(captureContext);
  })
);

export default router;
