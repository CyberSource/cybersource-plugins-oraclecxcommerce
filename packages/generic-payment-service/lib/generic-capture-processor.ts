/**
 * @namespace isv-occ-payment
 */
'use strict';

/** Oracle Commerce generic payment processor implementation
 * @module generic-refund-processor
 */
import { PaymentProcessor } from '@isv-occ-payment/occ-payment-service';
import referenceInfoFallback from '@isv-occ-payment/server-extension/cjs/services/payments/converters/request/referenceInfoFallback';
import captureRequest from '@isv-occ-payment/server-extension/cjs/services/payments/converters/request/capture';
import processCapture from '@isv-occ-payment/server-extension/cjs/services/payments/api/processCapture';
import captureResponse from '@isv-occ-payment/server-extension/cjs/services/payments/converters/response/generic/capture';

/**
 * Process refund processor class
 * @class
 * @alias module:generic-refund-processor.GenericCaptureProcessor
 * @extends PaymentProcessor
 */
export class GenericCaptureProcessor extends PaymentProcessor {
  constructor() {
    super({
      name: 'capture',
      middlewares: [referenceInfoFallback, captureRequest, processCapture, captureResponse]
    });
  }
}
