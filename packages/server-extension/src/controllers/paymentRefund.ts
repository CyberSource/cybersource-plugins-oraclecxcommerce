import { asyncMiddleware, RequestContext, validateRequest } from '@server-extension/common';
import { NextFunction, Request, Response, Router } from 'express';
import refundPayment from '../services/payments/paymentRefundService';
import { checkSchema } from 'express-validator';
import { schema } from './validation/refundPaymentSchema';
const { LogFactory } = require('@isv-occ-payment/occ-payment-factory');
const router = Router();
const logger = LogFactory.logger();

/**
 * Authentication and authorization middleware for refund operations
 */
async function authorizeRefund(req: Request, res: Response, next: NextFunction) {
  try {
    const refundRequest = req.body;

    // Verify the request includes authentication credentials from OCC
    // OCC should set authentication headers when forwarding requests from authenticated users
    const occAuthHeader = req.headers['x-occ-authentication'] || req.headers['authorization'];

    if (!occAuthHeader) {
      logger.error(`Refund request rejected: Missing authentication header.`);
      res.status(401).json({
        status: 401,
        message: 'Authentication required. Refund operations must be authenticated.',
        errorCode: 'REFUND_AUTH_REQUIRED'
      });
      return;
    }

    // Verify request includes valid channel and site identification from OCC
    const channel = req.headers['x-ccasset-channel'] as string;
    const siteId = req.headers['x-ccsite'] as string;

    if (!channel || !siteId) {
      logger.error(`Refund request rejected: Missing channel or siteId.`);
      res.status(403).json({
        status: 403,
        message: 'Invalid request context. Channel and site identification required.',
        errorCode: 'REFUND_INVALID_CONTEXT'
      });
      return;
    }

    // Basic format validation for transaction ID
    const transactionId = refundRequest.transactionId;
    if (!transactionId || typeof transactionId !== 'string' || transactionId.length < 10 || transactionId.length > 100) {
      logger.error(`Refund request rejected: Invalid transaction ID format.`);
      res.status(400).json({
        status: 400,
        message: 'Invalid transaction ID format.',
        errorCode: 'REFUND_INVALID_TRANSACTION_ID'
      });
      return;
    }

    // They should be alphanumeric with hyphens/underscores, no special chars that could indicate injection
    if (!/^[a-zA-Z0-9_-]+$/.test(transactionId)) {
      logger.error(`Refund request rejected: Transaction ID contains invalid characters.`);
      res.status(400).json({
        status: 400,
        message: 'Transaction ID contains invalid characters.',
        errorCode: 'REFUND_INVALID_TRANSACTION_ID'
      });
      return;
    }

    // Verify refund amount is reasonable and not attempting fraud
    const amount = parseFloat(refundRequest.amount);

    if (isNaN(amount) || amount <= 0) {
      logger.error(`Refund request rejected: Invalid amount (must be positive).`);
      res.status(400).json({
        status: 400,
        message: 'Refund amount must be a positive number.',
        errorCode: 'REFUND_INVALID_AMOUNT'
      });
      return;
    }
    // Authorization successful - proceed to refund processing
    next();

  } catch (error) {
    logger.error(`Refund authorization error: ${error.message}`, error);
    res.status(500).json({
      status: 500,
      message: 'Internal server error during authorization.',
      errorCode: 'REFUND_AUTH_ERROR'
    });
  }
}
router.post(
  '/',
  checkSchema(schema),
  validateRequest,
  authorizeRefund,
  asyncMiddleware(async (req: Request, res: Response, _next: NextFunction) => {
    const refundRequest = <OCC.RefundPaymentRequest>req.body;
    const requestContext = <RequestContext>res.locals;

    try {
      const response = await refundPayment(refundRequest, requestContext);
      logger.info(`Refund Webhook Response ${JSON.stringify(response)}`);
      res.json(response);
    } catch (error) {
      logger.error(`Refund processing failed ${error.message}`, error);
      throw error; // Let error middleware handle it
    }
  })
);

export default router;
