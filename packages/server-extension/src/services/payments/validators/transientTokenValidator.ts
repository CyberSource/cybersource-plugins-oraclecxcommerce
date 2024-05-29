import cryptoService from '@server-extension/services/cryptoService';
import jwtService from '@server-extension/services/jwtService';
import { Request, Response } from 'express';

function jwkToPem(context: string) {
  const payload = jwtService.decode(context).payload;
  const jwk = payload.flx.jwk;

  return jwtService.jwkToPem(jwk);
}

function validateCaptureContext(captureContext?: string, encryptedData?: string, iv?: string) {
  if (
    !captureContext ||
    !encryptedData ||
    !iv ||
    !cryptoService.validate(captureContext, {
      encrypted: encryptedData,
      iv
    })
  ) {
    throw new Error('Transient token could not be verified');
  }
}

export default function validateTransientToken(req: Request, res: Response) {
  const { customProperties } = req.body;

  if (customProperties && customProperties.transientTokenJwt) {
    const token = customProperties.transientTokenJwt;
    const captureContext = customProperties.captureContext;

    validateCaptureContext(
      captureContext,
      customProperties.captureContextCipherEncrypted,
      customProperties.captureContextCipherIv
    );

    try {
      jwtService.verify(token, jwkToPem(<string>captureContext));
    } catch (err) {
      
      throw new Error('Transient token is not valid: ' + err.message);
    }
  }
}
