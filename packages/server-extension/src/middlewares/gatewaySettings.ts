import { NextFunction, Request, Response } from 'express';
import nconf from 'nconf';
import { asyncMiddleware, RequestContext } from '../common';
import cacheService from '../services/cacheService';
import occClient from '../services/occ/occClient';

const DEFAULT_CACHE_TTL_SECS = 300;

async function getFromCache(channel: string, siteId: string): Promise<OCC.GatewaySettings> {
  const ttl = Number(nconf.get('cache.gatewaysettings.ttl.secs'));
  return cacheService
    .cacheAsync(
      'gatewaySettings_getGatewaySettings',
      occClient.getGatewaySettings.bind(occClient, siteId),
      isNaN(ttl) ? DEFAULT_CACHE_TTL_SECS : ttl
    )
    .then((response) => 
      response.data[channel]);
}

export default asyncMiddleware(async (req: Request, _res: Response, next: NextFunction) => {
  const requestContext: RequestContext = req.app.locals;
  const rawHeaders = req.rawHeaders;
  let siteId: string = '';
  if (req?.body?.siteId) {
    siteId = req.body.siteId
  }
  else {
    for (let i = 0; i < rawHeaders.length; i += 2) {
      if (rawHeaders[i] === 'x-ccsite') {
        siteId = rawHeaders[i + 1];
        break;
      }
    }
  }
  requestContext.gatewaySettings = await getFromCache(requestContext.channel, siteId);
  requestContext.siteId = siteId;
  next();
});
