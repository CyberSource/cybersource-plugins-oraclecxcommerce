
import jwtService from '@server-extension/services/jwtService';
import cryptoService from '@server-extension/services/cryptoService';
import publicKeyApi from '@server-extension/services/publicKeyApi';
import makeRequest from '@server-extension/services/payments/api/paymentCommand';
import { Request, Response, NextFunction } from 'express';

const { LogFactory } = require('@isv-occ-payment/occ-payment-factory');
const logger = LogFactory.logger();

/**
* Extracts JWK from a verified captureContext and converts it to PEM format
* @param context Verified captureContext JWT
* @returns PEM-formatted public key
*/
function jwkToPem(context: string) {
  const payload = jwtService.decode(context).payload;
  const jwk = payload.flx.jwk;

  return jwtService.jwkToPem(jwk);
}

/**
* Retrieves and verifies the captureContext from encrypted server-side storage
* @param customProperties Custom properties from request
* @param merchantConfig Merchant configuration for CyberSource API calls
* @returns Verified captureContext
*/
async function getTrustedCaptureContext(customProperties: any, merchantConfig: any): Promise<string> {

  if (!customProperties.captureContextCipherEncrypted || !customProperties.captureContextCipherIv) {
    throw new Error('Missing encrypted captureContext. Transient token validation requires server-encrypted captureContext.');
  }

  let captureContext: string;

  try {
    // Decrypt the captureContext from the server-encrypted cipher
    captureContext = cryptoService.decrypt({
      encrypted: customProperties.captureContextCipherEncrypted,
      iv: customProperties.captureContextCipherIv
    });

    logger.debug('Successfully decrypted captureContext from server-side cipher');
  } catch (error) {
    throw new Error('Invalid encrypted captureContext. Cannot verify transient token.');
  }

  // Verify the captureContext signature against Cybersource's public key
  try {
    const keyId = jwtService.getKid(captureContext);
    const publicKey: any = await makeRequest(
      merchantConfig,
      publicKeyApi,
      'getPublicKey',
      keyId
    );

    // Verify the captureContext signature
    jwtService.signatureVerify(captureContext, publicKey);
    logger.debug('Successfully verified captureContext signature against Cybersource public key');
  } catch (error) {
    logger.error('CaptureContext signature verification failed: ' + error.message);
    throw new Error('Invalid captureContext signature. Cannot verify transient token.');
  }

  return captureContext;
}

/**
* Validates that a transient token JWT was signed with the key from a trusted captureContext
*/
export async function validateTransientToken(customProperties: any, merchantConfig: any) {
  if (customProperties && customProperties.transientTokenJwt) {
    const token = customProperties.transientTokenJwt;
    if (!merchantConfig) {
      logger.error('[validateTransientToken] merchantConfig is undefined. It must be passed explicitly.');
      throw new Error('merchantConfig is missing. Pass it explicitly to validateTransientToken.');
    }
    const trustedCaptureContext = await getTrustedCaptureContext(
      customProperties,
      merchantConfig
    );
    try {
      // Verify the transient token using the JWK from the trusted captureContext
      jwtService.verify(token, jwkToPem(trustedCaptureContext));
      logger.debug('Transient token validation successful');
    } catch (err) {
      logger.error('Transient token verification failed: ' + err.message);
      throw new Error('Transient token is not valid: ' + err.message);
    }
  }
}

// Express middleware wrapper for validateTransientToken
export function validateTransientTokenExpress(req: Request, res: Response, next: NextFunction) {
  validateTransientToken(req.body.customProperties, res.locals.merchantConfig)
    .then(() => next())
    .catch((err) => next(err));
}

 