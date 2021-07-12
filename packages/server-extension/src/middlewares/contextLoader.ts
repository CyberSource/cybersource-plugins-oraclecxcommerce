import { RequestContext } from '@server-extension/common';
import loggingService from '@server-extension/services/loggingService';
import occClient from '@server-extension/services/occ/occClient';
import { NextFunction, Request, Response } from 'express';

function contextLoader(req: Request, res: Response, next: NextFunction) {
  const requestContext: RequestContext = req.app.locals;
  const { logger } = res.locals;

  requestContext.channel = req.body?.channel || req.headers['channel'];

  loggingService.init(logger);
  occClient.init(logger);

  next();
}

export default contextLoader;
