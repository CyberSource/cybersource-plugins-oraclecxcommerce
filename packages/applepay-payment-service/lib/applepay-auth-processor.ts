/**
 * @namespace isv-occ-payment
 */

'use strict';

/**
 * ApplePay authorization processor
 * @module applepay-auth-processor
 * @requires module:@isv-occ-payment/occ-payment-service/PaymentProcessor
 */

import { PaymentProcessor } from '@isv-occ-payment/occ-payment-service';
import validateDeviceFingerprintSessionId from '@isv-occ-payment/server-extension/cjs/services/payments/validators/deviceFingerprintSessionIdValidator';
import applepayAuthorizationRequest from '@isv-occ-payment/server-extension/cjs/services/payments/converters/request/applepayAuthorization';
import processPayment from '@isv-occ-payment/server-extension/cjs/services/payments/api/processPayment';
import createGenericAuthorizationResponse from '@isv-occ-payment/server-extension/cjs/services/payments/converters/response/generic/genericAuthorization';
import autoAuthReversal from '@isv-occ-payment/server-extension/cjs/services/payments/autoAuthReversalService';

/**
 * @class
 * @alias module:applepay-auth-processor.ApplepayAuthProcessor
 * @extends PaymentProcessor
 */
export class ApplepayAuthProcessor extends PaymentProcessor {
  constructor() {
    super({
      name: 'auth',
      middlewares: [
        validateDeviceFingerprintSessionId,
        applepayAuthorizationRequest,
        processPayment,
        createGenericAuthorizationResponse,
        autoAuthReversal
      ]
    });
  }
}
