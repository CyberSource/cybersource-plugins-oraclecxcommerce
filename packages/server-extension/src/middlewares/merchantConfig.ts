import { MerchantConfig } from 'cybersource-rest-client';
import { NextFunction, Request, Response } from 'express';
import nconf from 'nconf';
import path from 'path';
import { RequestContext } from '../common';
import * as fs from 'fs';
import { withP12Extension } from '../utils/mleDecryptionUtils';
const forge = require('node-forge');
const { LogFactory } = require('@isv-occ-payment/occ-payment-factory');
const logger = LogFactory.logger();
const SJC_KEY_ALIAS = 'CyberSource_SJC_US';
const AUTHENTICATION_TYPE = 'jwt';
const JWT_KEY_TYPE = 'SHARED_SECRET';


function proxySettings() {
  const hasProxy = Boolean(process.env.http_proxy || nconf.get('general:proxy-server'));
  let url = nconf.get('general:proxy-server');
  const { hostname = null, port = null } = url ? new URL(url) : {};

  return (
    hasProxy && {
      useProxy: true,
      proxyAddress: hostname,
      proxyPort: port
    }
  );
}



// Extracts public cert from P12 and saves as PEM for request MLE
function extractSjcPemFromP12(p12FilePath: string, passphrase: string, outputDir: string): string | null {
  let pemPath: string | null = null;

  try {
    const candidatePemPath = path.join(outputDir, 'mle-request-sjc.pem');
    const p12Buffer = fs.readFileSync(p12FilePath);
    const p12Der = forge.util.binary.raw.encode(new Uint8Array(p12Buffer));
    const p12Asn1 = forge.asn1.fromDer(p12Der);
    const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, passphrase);
    const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
    const bags = certBags[forge.pki.oids.certBag] || [];

    for (const bag of bags) {
      const cn = bag.cert.subject.getField('CN');
      if (cn && cn.value === SJC_KEY_ALIAS) {
        fs.writeFileSync(candidatePemPath, forge.pki.certificateToPem(bag.cert));
        pemPath = candidatePemPath;
        break;
      }
    }
  } catch (error: any) {
    logger.error(`[MLE] Failed to extract cert from P12: ${error.message}`);
    pemPath = null;
  }
  return pemPath;
}

function createMerchantConfig(settings: OCC.GatewaySettings): MerchantConfig {
  const keysDirectory = path.join(__dirname, '../../certs');

  const config: any = {
    authenticationType: AUTHENTICATION_TYPE,
    jwtKeyType: JWT_KEY_TYPE,
    runEnvironment: settings.runEnvironment,

    merchantID: settings.merchantID,
    merchantKeyId: settings.merchantKeyId,
    merchantsecretKey: settings.merchantsecretKey,

    logConfiguration: {
      enableLog: false,
      logFilename: settings.logFilename,
      logDirectory: settings.logDirectory,
      logFileMaxSize: settings.logFileMaxSize,
    },
    ...proxySettings()
  };

  // Request MLE — hardcoded always enabled, extracts CyberSource_SJC_US PEM from P12
  if (settings.responseMlePrivateKeyFileName) {
    const p12FilePath = path.join(keysDirectory, withP12Extension(settings.responseMlePrivateKeyFileName));
    const p12Passphrase = settings.responseMlePrivateKeyPass || '';
    const sjcPemPath = extractSjcPemFromP12(p12FilePath, p12Passphrase, keysDirectory);
    if (sjcPemPath) {
      config.enableRequestMLEForOptionalApisGlobally = true;
      config.mleForRequestPublicCertPath = sjcPemPath;
      config.requestMleKeyAlias = SJC_KEY_ALIAS;
    }
  }

  // Response MLE — controlled by messageEncryptionEnabled gateway setting
  if (settings.messageEncryptionEnabled && settings.responseMlePrivateKeyFileName) {
    const p12FilePath = path.join(keysDirectory, withP12Extension(settings.responseMlePrivateKeyFileName));
    config.enableResponseMleGlobally = true;
    config.responseMlePrivateKeyFilePath = p12FilePath;

    if (settings.responseMlePrivateKeyPass) {
      config.responseMlePrivateKeyFilePassword = settings.responseMlePrivateKeyPass;
    }
  }

  return config;
}

export default (req: Request, res: Response, next: NextFunction) => {

  const requestContext: RequestContext = res.locals.requestContext;
  const { gatewaySettings } = requestContext;
  const reqPath = req.path || req.originalUrl;

  const isWebhookTokenUpdate = reqPath.includes('/ccstorex/custom/isv-payment/v2/webhook/tokenUpdate');
  const isReturnUrl = reqPath.includes('/isv-payment/v2/payerAuth/returnUrl');

  if ((isWebhookTokenUpdate || !isReturnUrl) && gatewaySettings) {
    requestContext.merchantConfig = createMerchantConfig(gatewaySettings);
    res.locals.merchantConfig = requestContext.merchantConfig;
  }

  next();

};
