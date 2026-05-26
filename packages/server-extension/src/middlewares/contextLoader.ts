import { RequestContext } from '@server-extension/common';
import loggingService from '@server-extension/services/loggingService';
import occClient from '@server-extension/services/occ/occClient';
import occClientStorefront from '@server-extension/services/occ/occClientStorefront';
import { NextFunction, Request, Response } from 'express';

const { LogFactory } = require('@isv-occ-payment/occ-payment-factory');
const logger = LogFactory.logger();

function contextLoader(req: Request, res: Response, next: NextFunction) {
  res.locals.data = res.locals.data || {};
  res.locals.requestContext = res.locals.requestContext || {};
  const requestContext: RequestContext = res.locals.requestContext;
  requestContext.channel = req.body?.channel || req.headers['channel'] || 'storefront';
  loggingService.init(logger);
  occClient.init(logger);
  occClientStorefront.init(logger);
  next();
}

export default contextLoader;
