import { RequestContext } from '@server-extension/common';
import fs from 'fs';
import nconf from 'nconf';
import path from 'path';
import https from 'https';
import { HttpsProxyAgent } from 'https-proxy-agent';
 

let CERT: string | null = null;
let KEY: string | null = null;
 
const CERT_PATH = path.join(__dirname, '../../../certs/applePayIdentityCert.pem');
const KEY_PATH = path.join(__dirname, '../../../certs/applePayIdentityKey.key');
 
const createRequest = (validationUrl: string,body:string,cert:string,key:string) => {
  const occProxy: string | undefined = process.env.http_proxy || nconf.get('general:proxy-server');
  const requestOptions: https.RequestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    key: key,
    cert:cert,
  };
 
  if (occProxy) {
    requestOptions.agent = new HttpsProxyAgent(occProxy);
  }
 
  return new Promise((resolve, reject) => {
    const req = https.request(validationUrl, requestOptions, (res) => {
      let data = '';
 
      res.on('data', (chunk) => {
        data += chunk;
      });
 
      res.on('end',() => {
        try {
          if(res.statusCode === 200){
          const json = JSON.parse(data);
          return resolve(json);
          }else{
            return reject(data);
          }
        } catch (error) {
          return reject(error);
        };
      });
    });
 
    req.on('error', (error) => {
      reject(error);
    });
    req.write(body);
    req.end();
  });
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
 
  const body = JSON.stringify({
    merchantIdentifier: settings.applePayMerchantId,
    initiativeContext: settings.applePayInitiativeContext,
    initiative: settings.applePayInitiative,
    displayName: settings.applePayDisplayName,
    domainName: settings.applePayInitiativeContext
  });
 
  const validationResult = <any>await createRequest(validationUrl,body, CERT, KEY);
  return validationResult;
}