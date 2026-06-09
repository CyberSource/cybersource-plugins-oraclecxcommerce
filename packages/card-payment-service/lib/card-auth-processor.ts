/**
 * @namespace isv-occ-payment
 */

'use strict';

/**
 * Card authorization processor
 * @module card-auth-processor
 * @requires module:@isv-occ-payment/occ-payment-service/PaymentProcessor
 */

import { PaymentProcessor } from '@isv-occ-payment/occ-payment-service';
import { Request, Response } from 'express';
import { validateTransientToken } from '@isv-occ-payment/server-extension/cjs/services/payments/validators/transientTokenValidator';
import validateDeviceFingerprintSessionId from '@isv-occ-payment/server-extension/cjs/services/payments/validators/deviceFingerprintSessionIdValidator';
import cardAuthorizationRequest from '@isv-occ-payment/server-extension/cjs/services/payments/converters/request/cardAuthorization';
import processPayment from '@isv-occ-payment/server-extension/cjs/services/payments/api/processPayment';
import authorizationResponse from '@isv-occ-payment/server-extension/cjs/services/payments/converters/response/card/authorization';
import autoAuthReversal from '@isv-occ-payment/server-extension/cjs/services/payments/autoAuthReversalService';

/**
 * @class
 * @alias module:card-auth-processor.CardAuthProcessor
 * @extends PaymentProcessor
 */
export class CardAuthProcessor extends PaymentProcessor {
  constructor() {
    super({
      name: 'auth',
      middlewares: [
        validateTransientToken,
            async (req: Request, res: Response) => {
              const customProperties = req.body && (req.body as any).customProperties;
              const merchantConfig = (req as any).merchantConfig;
              await validateTransientToken(customProperties, merchantConfig);
            },
        validateDeviceFingerprintSessionId,
        cardAuthorizationRequest,
        processPayment,
        authorizationResponse,
        autoAuthReversal
      ]
    });
  }
}
