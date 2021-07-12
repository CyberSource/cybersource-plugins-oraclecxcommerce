import { Response } from 'express';
import { ApiExecutionError } from '../apiExecutionError';
import { ErrorHandler } from './common';
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

    res.status(err.status);
    res.json(<OCC.ErrorResponse>{
      status: err.status,
      reason,
      message,
      devMessage: details
    });
  }
}
