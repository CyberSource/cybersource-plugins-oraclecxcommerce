import loggingService from '@server-extension/services/loggingService';
import { NextFunction, Request, Response } from 'express';
import { maskRequestData } from '@server-extension/common';

function loggerMiddleware(req: Request, res: Response, next: NextFunction) {
  loggingService.info(
    'logging.api.access',
    `${req.protocol.toUpperCase()} ${req.method.toUpperCase()} ${req.url}`
  );
  req.method.toUpperCase() != 'GET' && loggingService.info('logging.webhook.http', `Request-payload : ${JSON.stringify(maskRequestData(req.body))}`)

  next();
}

export default loggerMiddleware;
