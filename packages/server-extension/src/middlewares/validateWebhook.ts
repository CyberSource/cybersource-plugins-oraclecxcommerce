import { NextFunction, Request, Response } from 'express';
import nconf from 'nconf';
import validateWebHookPayloadSignature from '../services/occ/webhookSignatureValidation';
import { LogFactory } from '@isv-occ-payment/occ-payment-factory';
import { getSavedNetworkTokenConfigurations } from '@server-extension/services/payments/converters/response/mappers';

const WEBHOOK_OCC_SIGNATURE_HEADER = 'x-oracle-cc-webhook-signature-sha512';
const WEBHOOK_ISV_SIGNATURE_HEADER = 'v-c-signature';
const logger = LogFactory.logger();

/**
 * List of local IP addresses that should skip validation in development mode only
 */
const LOCAL_IPS = ['127.0.0.1', '::1', '::ffff:127.0.0.1'];

/**
 * Determines if webhook signature validation should be skipped
 * @param req - Express request object
 * @returns true if validation should be skipped (development only), false otherwise
 */
function shouldSkipValidation(req: Request): boolean {
  // Only allow skipping validation in development mode when explicitly enabled
  const isDevelopmentMode = process.env.NODE_ENV === 'development';
  const skipValidationEnabled = process.env.SKIP_WEBHOOK_VALIDATION === 'true';

  if (!isDevelopmentMode || !skipValidationEnabled) {
    // Production mode or skip not enabled - always validate
    return false;
  }

  // In development mode with skip enabled, check if request is from actual localhost
  // Use req.ip or req.socket.remoteAddress - these cannot be spoofed by Host header
  const sourceIp = req.ip || req.socket?.remoteAddress || '';

  const isLocalRequest = LOCAL_IPS.includes(sourceIp);

  if (isLocalRequest) {
    logger.debug(`DEVELOPMENT ONLY: Skipping webhook validation for local request from ${sourceIp}`);
  } else {
    logger.debug(`Attempted validation bypass from non-local IP: ${sourceIp}`);
  }

  return isLocalRequest;
}

function getConfKeyFromUrl(url: string) {
  const urlParts = url.split('/');
  return urlParts[urlParts.length - 1] + '.secret.key';
}

export default function validateOCCWebhook(req: Request, res: Response, next: NextFunction) {
  const confKey = getConfKeyFromUrl(req.url);
  const secretKey = nconf.get(confKey);
  const signature = <string>req.headers[WEBHOOK_OCC_SIGNATURE_HEADER];
  const rawBody = req.rawBody;

  // This replaces the vulnerable SKIP_HOSTS check that used req.hostname
  if (shouldSkipValidation(req)) {
    logger.debug(`DEVELOPMENT ONLY: Webhook validation skipped for ${req.url} from ${req.ip || req.socket?.remoteAddress}`);
    next();
    return;
  }

  // Production path: always validate signature
  if (secretKey) {
    if (signature) {
      validateWebHookPayloadSignature(rawBody, signature, secretKey);
      logger.debug(`Webhook signature validated successfully for ${req.url}`);
    } else {
      logger.error(`Webhook signature missing for ${req.url} from ${req.ip || req.socket?.remoteAddress}`);
      throw new Error(`Signature not included. Access denied: ${req.url}`);
    }
  } else {
    // No secret key configured - this might be intentional for some webhooks
    logger.debug(`No secret key configured for ${req.url}, signature validation skipped`);
  }

  next();
}

export async function validateISVWebhook(req: Request, res: Response, next: NextFunction) {
  const vCSignatureHeader = <string>req.headers[WEBHOOK_ISV_SIGNATURE_HEADER];
  logger.debug("ISV Webhook Signature: vcSignatureHeader: " + vCSignatureHeader)
  if (vCSignatureHeader) {
    const signatureFields = vCSignatureHeader.split(";");
    const timestamp = signatureFields[0].split("=")[1].trim();
    const keyId = signatureFields[1].split("=")[1].trim();
    const signature = signatureFields[2].split("sig=")[1].trim();
    if (!timestamp || !keyId || !signature) {
      throw new Error(`ISV Webhook Signature: missing timeStamp, keyId or signature : timeStamp: ${timestamp} keyId: ${keyId} signature: ${signature}`);
    }
    const webhookConfigurations = await getSavedNetworkTokenConfigurations();
    const { key } = webhookConfigurations.find((configuration: any) => configuration.keyId === keyId) || {} as { key?: string };
    if (!key) { throw new Error("No key available in saved configuration") };
    const webhookRequestData: OCC.Notification = req.body;
    const payload = webhookRequestData?.payload || [];
    validateWebHookPayloadSignature(timestamp + '.' + JSON.stringify(payload), signature, key, 'sha256');
    next();
  } else {
    throw new Error(`Signature not included. Access denied: ${req.url}`);
  }
}


