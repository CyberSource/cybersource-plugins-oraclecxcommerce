import { asyncMiddleware, RequestContext, validateRequest } from '@server-extension/common';
import { NextFunction, Request, Response, Router } from 'express';
import createSession from '../services/payments/applePayService';
import { checkSchema } from 'express-validator';
import { schema } from './validation/applePaySchema';
import { sanitizeUrl, isValidApplePayUrl } from '../services/payments/applePayService';
const { LogFactory } = require('@isv-occ-payment/occ-payment-factory');
const router = Router();
const logger = LogFactory.logger();

router.post(
  '/validate',
  checkSchema(schema),
  validateRequest,
  asyncMiddleware(async (req: Request, res: Response, _next: NextFunction) => {
    const validationUrl = <string>req.body.validationUrl;
    const requestContext = <RequestContext>req.app.locals;
    let sanitizedUrl = sanitizeUrl(validationUrl);
    if (!sanitizedUrl) {
      throw new Error("Invalid Validation URL");
    }
    let isUrlValid = await isValidApplePayUrl(sanitizedUrl);
    if (!isUrlValid) {
      throw new Error("URL does not match allowed domains or IP addresses");
    }
    const response = await createSession(sanitizedUrl, requestContext);
    logger.debug(`ApplePay session webhook response: ${JSON.stringify(response)}`);
    res.json(response);
  })
);

export default router;
