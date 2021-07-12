import loggingService from '@server-extension/services/loggingService';
import { NextFunction, Request, Response } from 'express';

function loggerMiddleware(req: Request, res: Response, next: NextFunction) {
  loggingService.info(
    'logging.api.access',
    `${req.protocol.toUpperCase()} ${req.method.toUpperCase()} ${req.url}`
  );

  next();
}

export default loggerMiddleware;
