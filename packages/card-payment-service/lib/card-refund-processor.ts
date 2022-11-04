/**
 * @namespace isv-occ-payment
 */
'use strict';

/** Oracle Commerce card payment processor implementation
 * @module card-refund-processor
 */
import { PaymentProcessor } from '@isv-occ-payment/occ-payment-service';
import referenceInfoFallback from '@isv-occ-payment/server-extension/cjs/services/payments/converters/request/referenceInfoFallback';
import refundRequest from '@isv-occ-payment/server-extension/cjs/services/payments/converters/request/refund';
import processRefund from '@isv-occ-payment/server-extension/cjs/services/payments/api/processRefund';
import refundResponse from '@isv-occ-payment/server-extension/cjs/services/payments/converters/response/card/refund';

/**
 * Process refund processor class
 * @class
 * @alias module:card-refund-processor.CardRefundProcessor
 * @extends PaymentProcessor
 */
export class CardRefundProcessor extends PaymentProcessor {
  constructor() {
    super({
      name: 'refund',
      middlewares: [referenceInfoFallback, refundRequest, processRefund, refundResponse]
    });
  }
}
