import { Response } from 'express';
import Api400ResponseHandler from './api400ResponseHandler';
import ApiErrorResponseHandler from './apiErrorResponseHandler';
import { DefaultErrorHandler } from './defaultErrorHandler';
import { RequestValidationErrorHandler } from './requestValidationErrorHandler';

// Handlers are listed in priority order with Default handler being the last one in the list
const ERROR_HANDLERS = [
  new Api400ResponseHandler(),
  new ApiErrorResponseHandler(),
  new RequestValidationErrorHandler(),
  new DefaultErrorHandler()
];

export function handleError(err: any, res: Response) {
  ERROR_HANDLERS.find((handler) => handler.supports(err))?.renderError(err, res);
}
