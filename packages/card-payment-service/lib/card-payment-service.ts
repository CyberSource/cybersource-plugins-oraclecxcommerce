/**
 * @namespace isv-occ-payment
 */

/** Oracle Commerce card payment service implementation
 * @module card-payment-service
 * @requires module:@isv-occ-payment/occ-payment-service/PaymentService
 * @requires module:card-auth-processor
 * @requires module:card-capture-processor
 * @requires module:card-void-processor
 * @requires module:card-refund-processor
 */

import { PaymentService } from '@isv-occ-payment/occ-payment-service';
import { CardAuthProcessor } from './card-auth-processor';
import { CardCaptureProcessor } from './card-capture-processor';
import { CardVoidProcessor } from './card-void-processor';
import { CardRefundProcessor } from './card-refund-processor';

/**
 * Payment service implementation
 * @class
 * @extends PaymentService
 */
export class CardPaymentService extends PaymentService {
  /**
   * Create service with all Oracle Commerce transaction processors
   * @see {@link module:card-auth-processor.CardAuthProcessor|CardAuthProcessor} - Authorization transaction processor<br>
   * @see {@link module:card-capture-processor.CardVoidProcessor|CardVoidProcessor} - Void transaction processor<br>
   * @see {@link module:card-void-processor.CardVoidProcessor|CardVoidProcessor} - Void transaction processor<br>
   * @see {@link module:card-refund-processor.CardRefundProcessor|CardRefundProcessor} - Refund transaction processor<br>
   * @constructor
   */
  constructor(opts: any) {
    super({
      processors: [
        new CardAuthProcessor(),
        new CardCaptureProcessor(),
        new CardVoidProcessor(),
        new CardRefundProcessor()
      ],
      ...opts
    });
  }
}
