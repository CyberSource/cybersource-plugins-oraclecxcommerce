import { NextFunction, Request, Response } from 'express';
import nconf from 'nconf';
import { asyncMiddleware, RequestContext } from '../common';
import cacheService from '../services/cacheService';
import occClient from '../services/occ/occClient';

const DEFAULT_CACHE_TTL_SECS = 300;

function convertValue(value: string): string | boolean {
  return value === 'true' || value === 'false' ? value === 'true' : value;
}

function getFromCache(channel: string): Promise<OCC.GatewaySettings> {
  const ttl = Number(nconf.get('cache.gatewaysettings.ttl.secs'));

  return cacheService
    .cacheAsync(
      'gatewaySettings_getGatewaySettings',
      occClient.getGatewaySettings.bind(occClient),
      isNaN(ttl) ? DEFAULT_CACHE_TTL_SECS : ttl
    )
    .then((response) => response.data[channel]);
}

function getFromPayload(req: Request): OCC.GatewaySettings | undefined {
  const payloadSettings = req.body.gatewaySettings;

  if (nconf.get('feature.gatewaysettings.payload') === 'enabled' && payloadSettings) {
    return Array.isArray(payloadSettings)
      ? payloadSettings?.reduce((gatewaySettings: any, { name, value }) => {
          gatewaySettings[name] = convertValue(value);
          return gatewaySettings;
        }, {})
      : payloadSettings;
  }

  return undefined;
}

export default asyncMiddleware(async (req: Request, _res: Response, next: NextFunction) => {
  const requestContext: RequestContext = req.app.locals;

  requestContext.gatewaySettings =
    getFromPayload(req) ?? (await getFromCache(requestContext.channel));

  next();
});
