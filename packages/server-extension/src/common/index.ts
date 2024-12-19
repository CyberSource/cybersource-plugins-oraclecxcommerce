import { RequestValidationError } from '../errors/index';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import { validationResult } from 'express-validator';

export * from './genericDispatcher';

export const CHANNEL_REGEX = /channel=([^,]+)/i;
export const CLIENT_VERSION ="v2";
export const REPLACECHARACTERREGEX = /~W!C@O#n/g;

const payload = ['email', 'lastName', 'firstName', 'expirationYear', 'expirationMonth', 'phoneNumber', 'cvv', 'securityCode','number','address1','postalCode','locality','address2','ipAddress'];
const replaceCharacterRegex = /./g;

export interface Logger {
  info: (message: string) => void;
  debug: (message: string) => void;
  error: (message: string) => void;
}

export interface RequestContext extends Record<string, any> { }

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

export const maskRequestData = (obj: any) => {
  let logData = JSON.parse(JSON.stringify(obj));
  replaceChar(logData);
  return logData;
};

const replaceChar = (logData: any) => {
  Object.keys(logData).forEach(key => {
    if ('object' === typeof logData[key]  &&  null !== logData[key]) {
      replaceChar(logData[key]);
    } else {
      if (payload.includes(key) && null !== logData[key] &&  "string" === typeof logData[key]) {
        logData[key] = logData[key].replace(replaceCharacterRegex, "x");
      }
    }
  });
};

export const iterateCustomProperties = (obj: any) => {
  Object.keys(obj).forEach(key => {
    if ('object' === typeof obj[key]   && null !== obj[key]) {
      iterateCustomProperties(obj[key])
    } else if ("string" === typeof obj[key]) { 
      obj[key] = obj[key].replace(REPLACECHARACTERREGEX, "=");
    }
  });
};