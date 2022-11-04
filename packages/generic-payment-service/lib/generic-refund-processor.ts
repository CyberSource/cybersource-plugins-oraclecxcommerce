/**
 * @namespace isv-occ-payment
 */
'use strict';

/** Oracle Commerce generic payment processor implementation
 * @module generic-refund-processor
 */
import { PaymentProcessor } from '@isv-occ-payment/occ-payment-service';
import referenceInfoFallback from '@isv-occ-payment/server-extension/cjs/services/payments/converters/request/referenceInfoFallback';
import refundRequest from '@isv-occ-payment/server-extension/cjs/services/payments/converters/request/refund';
import processRefund from '@isv-occ-payment/server-extension/cjs/services/payments/api/processRefund';
import refundResponse from '@isv-occ-payment/server-extension/cjs/services/payments/converters/response/generic/refund';

/**
 * Process refund processor class
 * @class
 * @alias module:generic-refund-processor.GenericRefundProcessor
 * @extends PaymentProcessor
 */
export class GenericRefundProcessor extends PaymentProcessor {
  constructor() {
    super({
      name: 'refund',
      middlewares: [referenceInfoFallback, refundRequest, processRefund, refundResponse]
    });
  }
}
