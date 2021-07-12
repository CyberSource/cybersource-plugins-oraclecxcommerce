import { Deferred } from '@payment-widget/common/deferred';
import occClient from '@payment-widget/services/occClient';
import { ValidationOptions } from '../common';
import { getOrderData } from './payerAuthRequestBuilder';

export default class CardinalCommerce {
  referenceId!: Deferred<string>;
  authJwt!: Deferred<string>;

  updateBin(bin: string) {
    Cardinal.trigger('bin.process', bin);
  }

  onSetupComplete(data: any): void {
    this.referenceId.resolve(data.sessionId);
  }

  onValidated(data: any, authJwt: string): void {
    if (data.ErrorNumber === 0) {
      this.authJwt.resolve(authJwt);
    } else {
      this.authJwt.reject(data.ErrorNumber);
    }
  }

  async generatePayerAuthJwt() {
    const orderData = getOrderData();

    const payerAuthJwt = await occClient.generatePayerAuthJwt(orderData);

    return payerAuthJwt;
  }

  setup() {
    Cardinal.on('payments.setupComplete', this.onSetupComplete.bind(this));
    Cardinal.on('payments.validated', this.onValidated.bind(this));
  }

  async initiate() {
    this.referenceId = new Deferred<string>();
    this.authJwt = new Deferred<string>();

    const jwt = await this.generatePayerAuthJwt();

    Cardinal.setup('init', jwt);
  }

  validatePayment(validationOptions: ValidationOptions): Promise<string> {
    Cardinal.continue(
      'cca',
      {
        AcsUrl: validationOptions.acsUrl,
        Payload: validationOptions.pareq
      },
      {
        OrderDetails: {
          TransactionId: validationOptions.authenticationTransactionId
        }
      }
    );

    return this.authJwt;
  }
}
