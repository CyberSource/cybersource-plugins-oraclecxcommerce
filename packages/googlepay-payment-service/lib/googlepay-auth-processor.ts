/**
 * @namespace isv-occ-payment
 */

'use strict';

/**
 * GooglePay authorization processor
 * @module googlepay-auth-processor
 * @requires module:@isv-occ-payment/occ-payment-service/PaymentProcessor
 */

import { PaymentProcessor } from '@isv-occ-payment/occ-payment-service';
import validateDeviceFingerprintSessionId from '@isv-occ-payment/server-extension/cjs/services/payments/validators/deviceFingerprintSessionIdValidator';
import googlepayAuthorizationRequest from '@isv-occ-payment/server-extension/cjs/services/payments/converters/request/googlepayAuthorization';
import processPayment from '@isv-occ-payment/server-extension/cjs/services/payments/api/processPayment';
import genericAuthorizationResponse from '@isv-occ-payment/server-extension/cjs/services/payments/converters/response/generic/genericAuthorization';
import autoAuthReversal from '@isv-occ-payment/server-extension/cjs/services/payments/autoAuthReversalService';
/**
 * @class
 * @alias module:googlepay-auth-processor.GooglepayAuthProcessor
 * @extends PaymentProcessor
 */
export class GooglepayAuthProcessor extends PaymentProcessor {
  constructor() {
    super({
      name: 'auth',
      middlewares: [
        validateDeviceFingerprintSessionId,
        googlepayAuthorizationRequest,
        processPayment,
        genericAuthorizationResponse,
        autoAuthReversal
      ]
    });
  }
}
