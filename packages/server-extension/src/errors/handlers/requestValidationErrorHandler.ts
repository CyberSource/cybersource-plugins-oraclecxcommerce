import { Response } from 'express';
import { RequestValidationError } from '../requestValidationError';
import { ErrorHandler } from './common';

export class RequestValidationErrorHandler implements ErrorHandler<RequestValidationError> {
  supports(err: unknown) {
    return err instanceof RequestValidationError;
  }

  renderError(err: RequestValidationError, res: Response<any>): void {
    const validationErrors = err.errors.array().map((error) => {
      
      return <OCC.ErrorDetails>{
        message: error.msg,
        ...(error.type === 'field') && { 'o:errorPath': `${error.location}:${error.path}` }
      };

    });

    res.status(400);
    res.json(<OCC.ErrorResponse>{
      status: 400,
      message: err.message,
      errors: validationErrors
    });
  }
}
