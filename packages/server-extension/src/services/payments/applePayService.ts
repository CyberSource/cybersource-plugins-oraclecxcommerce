import { RequestContext } from '@server-extension/common';
import fs from 'fs';
import nconf from 'nconf';
import path from 'path';
import request, * as superagent from 'superagent';
import httpProxy from 'superagent-proxy';

const CERT_PATH = path.join(__dirname, '../../../certs/applePayIdentityCertAndKey.pem');
const CERT = fs.readFileSync(CERT_PATH, 'utf8');

httpProxy(superagent);

const createRequest = (validationUrl: string) => {
  const occProxy: string = process.env.http_proxy || nconf.get('general:proxy-server');

  return occProxy ? request.post(validationUrl).proxy(occProxy) : request.post(validationUrl);
};

export default async function createSession(
  validationUrl: string,
  requestContext: RequestContext
): Promise<string> {
  const settings = requestContext.gatewaySettings;

  const validationResult = await createRequest(validationUrl)
    .set('Content-Type', 'application/json')
    .send({
      merchantIdentifier: settings.applePayMerchantId,
      initiativeContext: settings.applePayInitiativeContext,
      initiative: settings.applePayInitiative,
      displayName: 'Cloudlake' //TODO get this value from the store
    })
    .cert(CERT)
    .key(CERT);

  return validationResult.body;
}
