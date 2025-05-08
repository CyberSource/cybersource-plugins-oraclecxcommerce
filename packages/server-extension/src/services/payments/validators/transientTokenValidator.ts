import jwtService from '@server-extension/services/jwtService';
import { Request, Response } from 'express';

function jwkToPem(context: string) {
  const payload = jwtService.decode(context).payload;
  const jwk = payload.flx.jwk;

  return jwtService.jwkToPem(jwk);
}

export default function validateTransientToken(req: Request, res: Response) {
  const { customProperties } = req.body;

  if (customProperties && customProperties.transientTokenJwt) {
    const token = customProperties.transientTokenJwt;
    const captureContext = customProperties.captureContext;
    try {
      jwtService.verify(token, jwkToPem(<string>captureContext));
    } catch (err) {
      throw new Error('Transient token is not valid: ' + err.message);
    }
  }
}
