import jwtService from '@server-extension/services/jwtService';
import { Request, Response } from 'express';

export default function validateAuthJwt(req: Request, res: Response) {
  const authJwt = req.body.customProperties?.authJwt;

  if (authJwt) {
    const payerAuthKey = req.app.locals.gatewaySettings.payerAuthKey;
    try {
      jwtService.verify(authJwt, payerAuthKey);
    } catch (err) {
      throw new Error('authJwt is not valid: ' + err.message);
    }
  }
}
