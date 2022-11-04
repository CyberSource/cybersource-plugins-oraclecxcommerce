/**
 * @namespace isv-occ-payment
 */

/** Oracle Commerce applepay payment service implementation
 * @module card-payment-service
 * @requires module:@isv-occ-payment/occ-payment-service/PaymentService
 * @requires module:applepay-auth-processor
 */

import { PaymentService } from '@isv-occ-payment/occ-payment-service';
import { ApplepayAuthProcessor } from './applepay-auth-processor';

/**
 * Payment service implementation
 * @class
 * @extends PaymentService
 */
export class ApplepayPaymentService extends PaymentService {
  /**
   * Create service with all Oracle Commerce transaction processors
   * @see {@link module:applepay-auth-processor.ApplepayAuthProcessor|ApplepayAuthProcessor} - Authorization transaction processor<br>
   * @constructor
   */
  constructor(opts: any) {
    super({
      processors: [new ApplepayAuthProcessor()],
      ...opts
    });
  }
}
