import { MerchantConfig } from 'cybersource-rest-client';
import { NextFunction, Request, Response } from 'express';
import nconf from 'nconf';
import path from 'path';
import { RequestContext } from '../common';

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


function createMerchantConfig(settings: OCC.GatewaySettings): MerchantConfig {
  const keysDirectory = path.join(__dirname, '../../certs');

  return {
    authenticationType: settings.authenticationType,
    runEnvironment: settings.runEnvironment,

    merchantID: settings.merchantID,
    merchantKeyId: settings.merchantKeyId,
    merchantsecretKey: settings.merchantsecretKey,

    keyAlias: settings.keyAlias,
    keyPass: settings.keyPass,
    keyFileName: settings.keyFileName,
    keysDirectory: keysDirectory,

    logConfiguration: {
      enableLog: false,
      logFilename: settings.logFilename,
      logDirectory: settings.logDirectory,
      logFileMaxSize: settings.logFileMaxSize,
    },
    ...proxySettings()
  };
}

export default (req: Request, res: Response, next: NextFunction) => {
  const requestContext: RequestContext = req.app.locals;
  const { gatewaySettings } = requestContext;

  requestContext.merchantConfig = createMerchantConfig(gatewaySettings);

  next();
};
