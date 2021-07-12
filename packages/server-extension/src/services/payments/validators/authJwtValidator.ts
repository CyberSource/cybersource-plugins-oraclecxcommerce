import { middleware, PaymentContext } from '@server-extension/common';
import jwtService from '@server-extension/services/jwtService';

function validateAuthJwt(context: PaymentContext) {
  const { webhookRequest } = context;
  const authJwt = webhookRequest.customProperties?.authJwt;

  if (authJwt) {
    const payerAuthKey = context.requestContext.gatewaySettings.payerAuthKey;
    try {
      jwtService.verify(authJwt, payerAuthKey);
    } catch (err) {
      throw new Error('authJwt is not valid: ' + err.message);
    }
  }
}

export default middleware(validateAuthJwt);
