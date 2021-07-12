import { RequestValidationError } from '@server-extension/errors';
import { MerchantConfig } from 'cybersource-rest-client';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import { validationResult } from 'express-validator';

export * from './genericDispatcher';

export interface RequestContext {
  gatewaySettings: OCC.GatewaySettings;
  merchantConfig: MerchantConfig;
  channel: string;
}

export interface PaymentData {
  request?: Record<string, any>;
  response?: Record<string, any>;
  transactionId?: string;
}

export interface PaymentContext {
  requestContext: RequestContext;
  paymentMode: string;
  webhookRequest: OCC.GenericPaymentWebhookRequest;
  webhookResponse?: OCC.GenericPaymentWebhookResponse;
  data: PaymentData;
  getSetting: (key: string) => string | boolean;
  getOptions: (key: string) => Array<string>;
  hasOption: (key: string, option: string) => boolean;
  isValidForPaymentMode: (key: string) => boolean;
}

export const asyncMiddleware = (fn: RequestHandler) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  return Promise.resolve(fn(req, res, next)).catch(next);
};

export const noCache = (_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', 0);

  next();
};

export const validateRequest = (req: Request, _res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new RequestValidationError(errors);
  }

  next();
};
