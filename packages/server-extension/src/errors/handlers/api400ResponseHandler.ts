import { Response } from 'express';
import { ApiExecutionError } from '../apiExecutionError';
import { ErrorHandler } from './common';

const hasMarkers = (err: ApiExecutionError) => {
  const { status, code } = err.errorData.source;
  return status || code;
};

/*
 * Supports all types of 400 Responses from Payment REST SDK which are fired
 * in case PSP returns 400 status code for some of APIs
 */

export default class Api400ResponseHandler implements ErrorHandler<ApiExecutionError> {

  supports(err: unknown): boolean {
    return err instanceof ApiExecutionError && err.status == 400 && hasMarkers(err);
  }

  renderError(err: ApiExecutionError, res: Response): void {
    res.status(err.status);
    res.json(<OCC.ErrorResponse>{
      status: err.status,
      message: 'Something went wrong. Please try again later!'
    });

  }

}