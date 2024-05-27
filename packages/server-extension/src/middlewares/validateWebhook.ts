import { NextFunction, Request, Response } from 'express';
import nconf from 'nconf';
import validateWebHookPayloadSignature from '../services/occ/webhookSignatureValidation';
import { LogFactory } from '@isv-occ-payment/occ-payment-factory';
import { getSavedNetworkTokenConfigurations } from '@server-extension/services/payments/converters/response/mappers';

const SKIP_HOSTS = ['localhost', '127.0.0.1'];
const WEBHOOK_OCC_SIGNATURE_HEADER = 'x-oracle-cc-webhook-signature-sha512';
const WEBHOOK_ISV_SIGNATURE_HEADER = 'v-c-signature';
const logger = LogFactory.logger();

function getConfKeyFromUrl(url: string) {
  const urlParts = url.split('/');
  return urlParts[urlParts.length - 1] + '.secret.key';
}

export default function validateOCCWebhook(req: Request, res: Response, next: NextFunction) {
  const confKey = getConfKeyFromUrl(req.url);
  const secretKey = nconf.get(confKey);
  const signature = <string>req.headers[WEBHOOK_OCC_SIGNATURE_HEADER];
  const rawBody = req.rawBody;

  if (!SKIP_HOSTS.includes(req.hostname) && secretKey) {
    if (signature) {
      validateWebHookPayloadSignature(rawBody, signature, secretKey);
    } else {
      throw new Error(`Signature not included. Access denied: ${req.url}`);
    }
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
    logger.debug('ISV Webhook Signature: Saved Configurations ' + JSON.stringify(webhookConfigurations));
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


