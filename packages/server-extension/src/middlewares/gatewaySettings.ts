import { NextFunction, Request, Response } from 'express';
import nconf from 'nconf';
import { asyncMiddleware, RequestContext } from '../common';
import cacheService from '../services/cacheService';
import occClient from '../services/occ/occClient';

const { LogFactory } = require('@isv-occ-payment/occ-payment-factory');
const logger = LogFactory.logger();

const DEFAULT_CACHE_TTL_SECS = 300;

/**
* Validates and sanitizes siteId to prevent cache key manipulation
* @param siteId The site identifier to validate
* @returns Sanitized siteId or null if invalid
*/
function validateSiteId(siteId: string | undefined): string | null {
  if (!siteId || typeof siteId !== 'string') {
    return null;
  }

  // Remove any characters that could be used for cache key manipulation
  // Allow only alphanumeric, hyphens, and underscores
  const sanitized = siteId.replace(/[^a-zA-Z0-9_-]/g, '');

  // Ensure reasonable length (max 100 chars)
  if (sanitized.length === 0 || sanitized.length > 100) {
    logger.debug(`Invalid siteId format or length: ${siteId}`);
    return null;
  }

  return sanitized;
}

/**
* Validates and sanitizes channel to prevent cache key manipulation
* @param channel The channel identifier to validate
* @returns Sanitized channel or null if invalid
*/
function validateChannel(channel: string | undefined): string | null {
  if (!channel || typeof channel !== 'string') {
    return null;
  }

  // Remove any characters that could be used for cache key manipulation
  const sanitized = channel.replace(/[^a-zA-Z0-9_-]/g, '');

  // Ensure reasonable length (max 50 chars)
  if (sanitized.length === 0 || sanitized.length > 50) {
    logger.debug(`Invalid channel format or length: ${channel}`);
    return null;
  }

  return sanitized;
}

async function getFromCache(channel: string, siteId: string): Promise<OCC.GatewaySettings> {

  // Validate and sanitize inputs to prevent cache key manipulation
  const validatedChannel = validateChannel(channel);
  const validatedSiteId = validateSiteId(siteId);
  if (!validatedChannel || !validatedSiteId) {
    throw new Error('Invalid channel or siteId for gateway settings lookup');
  }

  // Include both channel and siteId in cache key to ensure proper tenant isolation
  // This prevents cross-tenant credential exposure
  const cacheKey = `gatewaySettings_${validatedChannel}_${validatedSiteId}`;

  logger.debug(`Gateway settings cache key: ${cacheKey}`);

  const ttl = Number(nconf.get('cache.gatewaysettings.ttl.secs'));
  return cacheService
    .cacheAsync(
      cacheKey,
      occClient.getGatewaySettings.bind(occClient, validatedSiteId),
      isNaN(ttl) ? DEFAULT_CACHE_TTL_SECS : ttl
    )
    .then((response) =>
      response.data[validatedChannel]);
}

export default asyncMiddleware(async (req: Request, res: Response, next: NextFunction) => {

  if (!res.locals.requestContext) {
    res.locals.requestContext = {};
  }
  const requestContext: RequestContext = res.locals.requestContext;
  const rawHeaders = req.rawHeaders;
  let siteId: string = '';

  // Skip validation for these paths
  const skipPaths = [
    '/isv-payment/v2/webhook/tokenUpdate',
    '/isv-payment/v2/payerAuth/returnUrl'
  ];
    const skip = skipPaths.some((p) => req.path.endsWith(p));

  // Extract siteId from request body or headers (unchanged)
  if (req?.body?.siteId) {
    siteId = req.body.siteId;
  } else {
    for (let i = 0; i < rawHeaders.length; i += 2) {
      if (rawHeaders[i] === 'x-ccsite') {
        siteId = rawHeaders[i + 1];
        break;
      }
    }
  }

  // Only throw errors for missing siteId/channel if not in skipPaths
  if (!skip && !siteId) {
    logger.error('Missing siteId in request');
    throw new Error('Missing required siteId parameter');
  }
  if (!skip && !requestContext.channel) {
    logger.error('Missing channel in request context');
    throw new Error('Missing required channel parameter');
  }

  // For skipPaths, skip validation and use raw values
  if (skip) {
    requestContext.gatewaySettings = await cacheService
      .cacheAsync(
        `gatewaySettings_${requestContext.channel}_${siteId}`,
        occClient.getGatewaySettings.bind(occClient, siteId),
        isNaN(Number(nconf.get('cache.gatewaysettings.ttl.secs')))
          ? DEFAULT_CACHE_TTL_SECS
          : Number(nconf.get('cache.gatewaysettings.ttl.secs'))
      )
      .then((response) => response.data[requestContext.channel]);
    requestContext.siteId = siteId;
    return next();
  }
  // For all other routes, validate channel and siteId
  requestContext.gatewaySettings = await getFromCache(requestContext.channel, siteId);
  requestContext.siteId = siteId;
  next();
});

 