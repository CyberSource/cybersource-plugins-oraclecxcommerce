import { asyncMiddleware, RequestContext, validateRequest, maskRequestData } from '@server-extension/common';
import { NextFunction, Request, Response, Router } from 'express';
import refundPayment from '../services/payments/paymentRefundService';
import { checkSchema } from 'express-validator';
import { schema } from './validation/refundPaymentSchema';
import { validateOccToken, validateAmount } from '../services/occ/authenticationService';

const { LogFactory } = require('@isv-occ-payment/occ-payment-factory');
const router = Router();
const logger = LogFactory.logger();

async function authorizeRefund(req: Request, res: Response, next: NextFunction) {
  try {
    const refundRequest = req.body;
    const authHeader = req.headers['x-occ-authentication'] as string || req.headers['authorization'] as string;

    if (!authHeader) {
      logger.error(`Refund request rejected: Missing authentication header.`);
      return res.status(401).json({
        status: 401,
        message: 'Authentication required. Refund operations must be authenticated.',
        errorCode: 'REFUND_AUTH_REQUIRED'
      });
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7): authHeader;
    const channel = req.headers['x-ccasset-channel'] as string;
    const siteId = req.headers['x-ccsite'] as string;

    if (!channel || !siteId) {
      logger.error(`Refund request rejected: Missing channel or siteId.`);
      return res.status(403).json({
        status: 403,
        message: 'Invalid request context. Channel and site identification required.',
        errorCode: 'REFUND_INVALID_CONTEXT'
      });
    }

    const tokenValidation = await validateOccToken(token, siteId);
    if (!tokenValidation.valid) {
      logger.error(`Refund request rejected: Invalid admin token. ${tokenValidation.error || ''}`);
      return res.status(401).json({
        status: 401,
        message: 'Authentication failed. Invalid or expired admin token.',
        errorCode: 'REFUND_AUTH_INVALID',
        moreInfo: tokenValidation.error || undefined
      });
    }

    const transactionId = refundRequest.transactionId;
    if (!transactionId || typeof transactionId !== 'string' ||
        transactionId.length < 10 || transactionId.length > 100 || (!/^[a-zA-Z0-9_-]+$/.test(transactionId))) {
      logger.error(`Refund request rejected: Invalid transaction ID format.`);
      return res.status(400).json({
        status: 400,
        message: 'Invalid transaction ID format.',
        errorCode: 'REFUND_INVALID_TRANSACTION_ID'
      });
    }


    const amount = parseFloat(refundRequest.amount);

    if (!validateAmount(amount)) {
      logger.error(`Refund request rejected: Invalid amount ${amount}`);
      return res.status(400).json({
        status: 400,
        message: 'Invalid refund amount. Amount must be positive and within allowed limits.',
        errorCode: 'REFUND_INVALID_AMOUNT'
      });
    }

    return next();
    
  } catch (error: any) {
    logger.error(`Refund authorization error: ${error.message}`, error);
    return res.status(500).json({
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
    const requestContext = <RequestContext>res.locals.requestContext;

    try {
      const response = await refundPayment(refundRequest, requestContext);
      logger.debug(`Refund processed: ${JSON.stringify(maskRequestData(response))}`);

      res.json(response);
    } catch (error: any) {
      logger.error(`Refund processing failed: ${error.message}`, error);
      throw error;
    }
  })
);

export default router;


 