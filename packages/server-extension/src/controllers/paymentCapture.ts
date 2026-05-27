import { asyncMiddleware, RequestContext, validateRequest, maskRequestData } from '@server-extension/common';
import { capturePayment } from '@server-extension/services/payments/paymentCaptureService';
import { NextFunction, Request, Response, Router } from 'express';
import { checkSchema } from 'express-validator';
import { schema } from './validation/capturePaymentSchema';
import { validateOccToken, validateAmount } from '../services/occ/authenticationService';

const { LogFactory } = require('@isv-occ-payment/occ-payment-factory');
const router = Router();
const logger = LogFactory.logger();

async function authorizeCapture(req: Request, res: Response, next: NextFunction) {
  try {
    const captureRequest = req.body;
    const authHeader = req.headers['x-occ-authentication'] as string || req.headers['authorization'] as string;

    if (!authHeader) {
      logger.error(`Capture request rejected: Missing authentication header.`);
      return res.status(401).json({
        status: 401,
        message: 'Authentication required. Payment capture operations must be authenticated.',
        errorCode: 'CAPTURE_AUTH_REQUIRED'
      });
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7): authHeader;
    const channel = req.headers['x-ccasset-channel'] as string;
    const siteId = req.headers['x-ccsite'] as string;

    if (!channel || !siteId) {
      logger.error(`Capture request rejected: Missing channel or siteId.`);
      return res.status(403).json({
        status: 403,
        message: 'Invalid request context. Channel and site identification required.',
        errorCode: 'CAPTURE_INVALID_CONTEXT'
      });
    }

    const tokenValidation = await validateOccToken(token, siteId);
    if (!tokenValidation.valid) {
      logger.error(`Capture request rejected: Invalid admin token. ${tokenValidation.error || ''}`);
      return res.status(401).json({
        status: 401,
        message: 'Authentication failed. Invalid or expired admin token.',
        errorCode: 'CAPTURE_AUTH_INVALID',
        moreInfo: tokenValidation.error || undefined
      });
    }

    const transactionId = captureRequest.transactionId;
    if (!transactionId || typeof transactionId !== 'string' ||
        transactionId.length < 10 || transactionId.length > 100 || (!/^[a-zA-Z0-9_-]+$/.test(transactionId))) {
      logger.error(`Capture request rejected: Invalid transaction ID format.`);
      return res.status(400).json({
        status: 400,
        message: 'Invalid transaction ID format.',
        errorCode: 'CAPTURE_INVALID_TRANSACTION_ID'
      });
    }

    const amount = parseFloat(captureRequest.amount);

    if (!validateAmount(amount)) {
      logger.error(`Capture request rejected: Invalid amount ${amount}`);
      return res.status(400).json({
        status: 400,
        message: 'Invalid capture amount. Amount must be positive and within allowed limits.',
        errorCode: 'CAPTURE_INVALID_AMOUNT'
      });
    }

    return next();

  } catch (error: any) {
    logger.error(`Capture authorization error: ${error.message}`, error);
    return res.status(500).json({
      status: 500,
      message: 'Internal server error during authorization.',
      errorCode: 'CAPTURE_AUTH_ERROR'
    });
  }
}

router.post(
  '/',
  checkSchema(schema),
  validateRequest,
  authorizeCapture,
  asyncMiddleware(async (req: Request, res: Response, _next: NextFunction) => {
    const captureRequest = <OCC.CapturePaymentRequest>req.body;
    const requestContext = <RequestContext>res.locals.requestContext;

    try {
      const captureResponse = await capturePayment(captureRequest, requestContext);
      logger.debug(`Capture processed: ${JSON.stringify(maskRequestData(captureResponse))}`);

      res.json(captureResponse);
    } catch (error: any) {
      logger.error(`Capture processing failed: ${error.message}`, error);
      throw error;
    }
  })
);

export default router;

 