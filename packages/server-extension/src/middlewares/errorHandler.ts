import loggingService from '@server-extension/services/loggingService';
import { NextFunction, Request, Response } from 'express';
import { handleError } from '../errors';

export default function errorHandler(err: any, req: Request, res: Response, next?: NextFunction) {
  if (!err) {
    if (next) {
      return next();
    }  
    return res.end();
  }

  loggingService.error('logging.api.error', err);

  handleError(err, res);
}
