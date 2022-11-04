/**
 * @namespace isv-occ-payment
 */

/** Oracle Commerce card payment processor implementation
 * @module card-void-processor
 */
import { PaymentProcessor } from '@isv-occ-payment/occ-payment-service';
import referenceInfoFallback from '@isv-occ-payment/server-extension/cjs/services/payments/converters/request/referenceInfoFallback';
import authorizationReversalRequest from '@isv-occ-payment/server-extension/cjs/services/payments/converters/request/authorizationReversal';
import processAuthorizationReversal from '@isv-occ-payment/server-extension/cjs/services/payments/api/processAuthorizationReversal';
import authorizationReversalResponse from '@isv-occ-payment/server-extension/cjs/services/payments/converters/response/card/authorizationReversal';

/**
 * Process void processor class
 * @class
 * @alias module:card-void-processor.CardVoidProcessor
 * @extends PaymentProcessor
 */
export class CardVoidProcessor extends PaymentProcessor {
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
