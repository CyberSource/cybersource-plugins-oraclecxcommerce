import { Response } from 'express';
import { ErrorHandler } from './common';

// Default handler for any error without specific handler available
export class DefaultErrorHandler implements ErrorHandler<any> {
  supports(_err: unknown): boolean {
    return true;
  }

  renderError(_err: any, res: Response): void {
    res.status(500);
    res.json(<OCC.ErrorResponse>{
      status: 500,
      message: 'An error occurred while executing request'
    });
  }
}
