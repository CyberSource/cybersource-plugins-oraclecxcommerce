import { RequestContext } from '@server-extension/common';
import fs from 'fs';
import nconf from 'nconf';
import path from 'path';
import request from 'superagent';
import httpProxy from 'superagent-proxy';


let CERT: string | null = null;
let KEY: string | null = null;

const CERT_PATH = path.join(__dirname, '../../../certs/applePayIdentityCert.pem');
const KEY_PATH = path.join(__dirname, '../../../certs/applePayIdentityKey.key');

httpProxy(request);

const createRequest = (validationUrl: string) => {
  const occProxy: string = process.env.http_proxy || nconf.get('general:proxy-server');

  return occProxy ? request.post(validationUrl).proxy(occProxy) : request.post(validationUrl);
};

export default async function createSession(
  validationUrl: string,
  requestContext: RequestContext
): Promise<string> {
  const settings = requestContext.gatewaySettings;

  if (!CERT) {
    CERT = fs.readFileSync(CERT_PATH, 'utf8');
  }
  if (!KEY) {
    KEY = fs.readFileSync(KEY_PATH, 'utf8');
  }

  const validationResult = await createRequest(validationUrl)
    .set('Content-Type', 'application/json')
    .send({
      merchantIdentifier: settings.applePayMerchantId,
      initiativeContext: settings.applePayInitiativeContext,
      initiative: settings.applePayInitiative,
      displayName: settings.applePayDisplayName,
      domainName: settings.applePayInitiativeContext
    })
    .cert(CERT)
    .key(KEY);

  return validationResult.body;
}
