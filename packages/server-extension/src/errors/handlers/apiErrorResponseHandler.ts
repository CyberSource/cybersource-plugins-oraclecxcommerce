import { Response } from 'express';
import { ApiExecutionError } from '../apiExecutionError';
import { ErrorHandler } from './common';
import loggingService from '@server-extension/services/loggingService';

/*
 * Supports ErrorResponse from Payment REST SDK which is fired
 * in case PSP returns 400 status code for some of APIs
 */
export default class ApiErrorResponseHandler implements ErrorHandler<ApiExecutionError> {
  supports(err: unknown): boolean {
    return (
      err instanceof ApiExecutionError && err.status == 400 && err.errorData.source.responseStatus
    );
  }

  renderError(err: ApiExecutionError, res: Response): void {
    const { reason, message, details } = err.errorData.source.responseStatus;
    loggingService.error('Error Response', {
      reason,
      message,
      details,
      api: err.errorData.api,
      operation: err.errorData.operation
    });

    // Return generic error message to client without leaking PSP internals
    res.status(err.status);
    res.json(<OCC.ErrorResponse>{
      status: err.status,
      message: 'Payment request could not be processed. Please verify your payment information and try again.'
    });
  }
}
