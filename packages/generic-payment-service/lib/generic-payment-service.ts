/**
 * @namespace isv-occ-payment
 */

/** Oracle Commerce generic payment service implementation
 * @module card-payment-service
 * @requires module:@isv-occ-payment/occ-payment-service/PaymentService
 * @requires module:generic-capture-processor
 * @requires module:generic-void-processor
 * @requires module:generic-refund-processor
 */

import { PaymentService } from '@isv-occ-payment/occ-payment-service';
import { GenericCaptureProcessor } from './generic-capture-processor';
import { GenericVoidProcessor } from './generic-void-processor';
import { GenericRefundProcessor } from './generic-refund-processor';

/**
 * Payment service implementation
 * @class
 * @extends PaymentService
 */
export class GenericPaymentService extends PaymentService {
  /**
   * Create service with all Oracle Commerce transaction processors
   * @see {@link module:generic-capture-processor.GenericVoidProcessor|GenericVoidProcessor} - Void transaction processor<br>
   * @see {@link module:generic-void-processor.GenericVoidProcessor|GenericVoidProcessor} - Void transaction processor<br>
   * @see {@link module:generic-refund-processor.GenericRefundProcessor|GenericRefundProcessor} - Refund transaction processor<br>
   * @constructor
   */
  constructor(opts: any) {
    super({
      processors: [
        new GenericVoidProcessor(),
        new GenericCaptureProcessor(),
        new GenericRefundProcessor()
      ],
      ...opts
    });
  }
}
