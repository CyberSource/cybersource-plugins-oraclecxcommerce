/**
 * @namespace isv-occ-payment
 */

/** Oracle Commerce googlepay payment service implementation
 * @module card-payment-service
 * @requires module:@isv-occ-payment/occ-payment-service/PaymentService
 * @requires module:googlepay-auth-processor
 */

import { PaymentService } from '@isv-occ-payment/occ-payment-service';
import { GooglepayAuthProcessor } from './googlepay-auth-processor';

/**
 * Payment service implementation
 * @class
 * @extends PaymentService
 */
export class GooglepayPaymentService extends PaymentService {
  /**
   * Create service with all Oracle Commerce transaction processors
   * @see {@link module:googlepay-auth-processor.GooglepayAuthProcessor|GooglepayAuthProcessor} - Authorization transaction processor<br>
   * @constructor
   */
  constructor(opts: any) {
    super({
      processors: [new GooglepayAuthProcessor()],
      ...opts
    });
  }
}
