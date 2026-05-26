import { asyncMiddleware, RequestContext, validateRequest } from '@server-extension/common';
import { capturePayment } from '@server-extension/services/payments/paymentCaptureService';
import { NextFunction, Request, Response, Router } from 'express';
import { checkSchema } from 'express-validator';
import { schema } from './validation/capturePaymentSchema';
const { LogFactory } = require('@isv-occ-payment/occ-payment-factory');
const router = Router();
const logger = LogFactory.logger();

/**
 * Authentication and authorization middleware for payment capture operation
 */
async function authorizeCapture(req: Request, res: Response, next: NextFunction) {
  try {
    const captureRequest = req.body;

    // Verify the request includes authentication credentials from OCC
    // OCC should set authentication headers when forwarding requests from authenticated users
    const occAuthHeader = req.headers['x-occ-authentication'] || req.headers['authorization'];

    if (!occAuthHeader) {
      logger.error(`Capture request rejected: Missing authentication header.`);
      res.status(401).json({
        status: 401,
        message: 'Authentication required. Payment capture operations must be authenticated.',
        errorCode: 'CAPTURE_AUTH_REQUIRED'
      });
      return;
    }

    // Verify request includes valid channel and site identification from OCC
    const channel = req.headers['x-ccasset-channel'] as string;
    const siteId = req.headers['x-ccsite'] as string;

    if (!channel || !siteId) {
      logger.error(`Capture request rejected: Missing channel or siteId.`);
      res.status(403).json({
        status: 403,
        message: 'Invalid request context. Channel and site identification required.',
        errorCode: 'CAPTURE_INVALID_CONTEXT'
      });
      return;
    }

    // Basic format validation for transaction ID (CyberSource transaction IDs follow specific patterns)
    const transactionId = captureRequest.transactionId;
    if (!transactionId || typeof transactionId !== 'string' || transactionId.length < 10 || transactionId.length > 100) {
      logger.error(`Capture request rejected: Invalid transaction ID format.`);
      res.status(400).json({
        status: 400,
        message: 'Invalid transaction ID format.',
        errorCode: 'CAPTURE_INVALID_TRANSACTION_ID'
      });
      return;
    }

    // Additional pattern validation for transaction IDs
    if (!/^[a-zA-Z0-9_-]+$/.test(transactionId)) {
      logger.error(`Capture request rejected: Transaction ID contains invalid characters.`);
      res.status(400).json({
        status: 400,
        message: 'Transaction ID contains invalid characters.',
        errorCode: 'CAPTURE_INVALID_TRANSACTION_ID'
      });
      return;
    }

    // Verify capture amount is reasonable and not attempting fraud
    const amount = parseFloat(captureRequest.amount);

    if (isNaN(amount) || amount <= 0) {
      logger.error(`Capture request rejected: Invalid amount (must be positive).`);
      res.status(400).json({
        status: 400,
        message: 'Capture amount must be a positive number.',
        errorCode: 'CAPTURE_INVALID_AMOUNT'
      });
      return;
    }
    // Authorization successful - proceed to capture processing
    next();
  } catch (error) {
    logger.error(`Capture authorization error: ${error.message}`, error);
    res.status(500).json({
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
    const requestContext = <RequestContext>res.locals;

    try {
      const captureResponse = await capturePayment(captureRequest, requestContext);
      logger.info(`Capture Webhook Response ${JSON.stringify(captureResponse)}`);
      res.json(captureResponse);
    } catch (error) {
      logger.error(`Capture processing failed ${error.message}`, error);
      throw error;
    }
  })
);

export default router;
