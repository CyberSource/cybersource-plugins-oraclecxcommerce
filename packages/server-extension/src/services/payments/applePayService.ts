import { RequestContext } from '@server-extension/common';
import fs from 'fs';
import nconf from 'nconf';
import path from 'path';
import https from 'https';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { URL } from 'url';
import { promises as dns } from 'dns';
const { LogFactory } = require('@isv-occ-payment/occ-payment-factory');
const logger = LogFactory.logger();

let CERT: string | null = null;
let KEY: string | null = null;

const CERT_PATH = path.join(__dirname, '../../../certs/applePayIdentityCert.pem');
const KEY_PATH = path.join(__dirname, '../../../certs/applePayIdentityKey.key');

const applePayAllowedDomains = {
  domains: [
    'apple-pay-gateway.apple.com',
    'cn-apple-pay-gateway.apple.com',
    'apple-pay-gateway-cert.apple.com',
    'cn-apple-pay-gateway-cert.apple.com',
  ],
  ipAddresses: [
    '17.171.78.7', '17.171.78.71', '17.171.78.135', '17.171.78.199', '17.171.79.12',
    '17.141.128.7', '17.141.128.71', '17.141.128.135', '17.141.128.199', '17.141.129.12',
    '17.32.214.7', '17.157.96.181', '17.33.194.239', '17.33.192.38', '17.33.193.110',
    '17.33.202.35', '17.33.201.101', '17.33.200.169',
    '101.230.204.232', '101.230.204.242', '101.230.204.240',
    '60.29.205.104', '60.29.205.106', '60.29.205.108',
    '17.171.85.7', '17.179.124.181', '17.32.214.56',
    '17.33.194.218', '17.33.192.145', '17.33.193.45',
    '17.33.200.47', '17.33.202.99', '17.33.201.105',
    '101.230.204.235',
  ],
};

export function sanitizeUrl(inputUrl: string) {
  try {
    const url = new URL(inputUrl);
    if (url.protocol !== 'https:') {
      throw new Error("URL must use HTTPS");
    }
    url.search = '';
    url.hash = '';
    return url.toString();
  } catch (err) {
    logger.error(`Invalid Validation URL : ${err}`);
    return null;
  }
}
export async function isValidApplePayUrl(validationUrl: string): Promise<boolean> {
  try {
    const url = new URL(validationUrl);
    const allowedDomains = applePayAllowedDomains.domains;
    const allowedIPs = applePayAllowedDomains.ipAddresses;
    if (!allowedDomains.includes(url.hostname)) {
      return false;
    }
    const resolvedIPs = await dns.resolve4(url.hostname);
    return resolvedIPs.some((ip: any) => allowedIPs.includes(ip));
  } catch (error) {
    logger.error(`URL does not match allowed domains or IP addresses": ${error}`);
    return false;
  }
}

const createRequest = (validationUrl: string, body: string, cert: string, key: string) => {
  const occProxy: string | undefined = process.env.http_proxy || nconf.get('general:proxy-server');
  const requestOptions: https.RequestOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    key: key,
    cert: cert,
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
      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const json = JSON.parse(data);
            return resolve(json);
          } else {
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

  const validationResult = <any>await createRequest(validationUrl, body, CERT, KEY);
  return validationResult;
}
