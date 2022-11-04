/**
 * @namespace isv-occ-payment
 */

/** Oracle Commerce generic payment processor implementation
 * @module generic-void-processor
 */
import { PaymentProcessor } from '@isv-occ-payment/occ-payment-service';
import referenceInfoFallback from '@isv-occ-payment/server-extension/cjs/services/payments/converters/request/referenceInfoFallback';
import authorizationReversalRequest from '@isv-occ-payment/server-extension/cjs/services/payments/converters/request/authorizationReversal';
import processAuthorizationReversal from '@isv-occ-payment/server-extension/cjs/services/payments/api/processAuthorizationReversal';
import authorizationReversalResponse from '@isv-occ-payment/server-extension/cjs/services/payments/converters/response/generic/authorizationReversal';

/**
 * Process void processor class
 * @class
 * @alias module:generic-void-processor.GenericVoidProcessor
 * @extends PaymentProcessor
 */
export class GenericVoidProcessor extends PaymentProcessor {
  constructor() {
    super({
      name: 'void',
      middlewares: [
        referenceInfoFallback,
        authorizationReversalRequest,
        processAuthorizationReversal,
        authorizationReversalResponse
      ]
    });
  }
}
