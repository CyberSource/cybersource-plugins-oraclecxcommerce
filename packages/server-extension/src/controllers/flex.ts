import { asyncMiddleware, RequestContext, validateRequest } from '../common/index';
import { NextFunction, Request, Response, Router } from 'express';
import { checkSchema } from 'express-validator';
import { createCaptureContext } from '../services/payments/flexService';
import { schema } from './validation/flexCaptureContextSchema';
const { LogFactory } = require('@isv-occ-payment/occ-payment-factory');

const router = Router();
const logger = LogFactory.logger();
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
    logger.debug(`Keys webhook response: ${JSON.stringify(captureContext)}`);
    res.json(captureContext);
  })
);

export default router;
