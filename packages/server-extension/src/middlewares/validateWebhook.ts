import { NextFunction, Request, Response } from 'express';
import nconf from 'nconf';
import validateWebHookPayloadSignature from '../services/occ/webhookSignatureValidation';

const SKIP_HOSTS = ['localhost', '127.0.0.1'];
const WEBHOOK_SIGNATURE_HEADER = 'x-oracle-cc-webhook-signature-sha512';

function validateWebhook(req: Request, res: Response, next: NextFunction) {
  const confKey = getConfKeyFromUrl(req.url);
  const secretKey = nconf.get(confKey);
  const signature = <string>req.headers[WEBHOOK_SIGNATURE_HEADER];
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

function getConfKeyFromUrl(url: string) {
  const urlParts = url.split('/');
  return urlParts[urlParts.length - 1] + '.secret.key';
}

export default validateWebhook;
