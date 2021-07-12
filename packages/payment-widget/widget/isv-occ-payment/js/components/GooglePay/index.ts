import { Deferred } from '@payment-widget/common/deferred';
import paymentActions, {
  ACTION_TYPE,
  PaymentAction,
  paymentActionFilter
} from '@payment-widget/store/paymentActions';
import paymentStore from '@payment-widget/store/paymentStore';
import ko from 'knockout';
import loadScript from '../utils/scriptLoader';
import { PaymentViewModel, viewModelFactory } from '../viewModelFactory';
import template from './index.html';
import { getGoogleIsReadyToPayRequest, getGooglePaymentDataRequest } from './requestBuilder';

type PaymentAuthorizationResult = google.payments.api.PaymentAuthorizationResult;
type PaymentData = google.payments.api.PaymentData;

const success = (): PaymentAuthorizationResult => ({ transactionState: 'SUCCESS' });

const error = (message: string): PaymentAuthorizationResult => ({
  transactionState: 'ERROR',
  error: {
    intent: 'PAYMENT_AUTHORIZATION',
    message: paymentStore.widget.translate(message),
    reason: 'PAYMENT_DATA_INVALID'
  }
});

const actionFilter = (action: ACTION_TYPE) => paymentActionFilter('googlepay', action);

export class PaymentGoogle implements PaymentViewModel {
  config: OCC.Config;
  paymentsClient!: google.payments.api.PaymentsClient;
  paymentResult: Deferred<PaymentAuthorizationResult>;

  loading = ko.observable(true);
  supported = ko.observable(false);

  constructor(params: any) {
    this.config = params.config;

    this.paymentResult = new Deferred<PaymentAuthorizationResult>();
  }

  async initialize(): Promise<void> {
    this.loading(true);

    await loadScript(this.config.googlePaySdkUrl);

    this.createClient();

    const response = await this.paymentsClient.isReadyToPay(
      getGoogleIsReadyToPayRequest(this.config)
    );

    if (response.result) {
      this.addGooglePayButton();

      this.supported(true);
    }

    this.initializePaymentActions();

    this.loading(false);
  }

  initializePaymentActions() {
    paymentActions.takePaymentAction(actionFilter('initiate'), this.initiatePayment.bind(this));
    paymentActions.takePaymentAction(actionFilter('validate'), this.validatePayment.bind(this));
    paymentActions.takePaymentAction(actionFilter('finalize'), this.finalizePayment.bind(this));
  }

  validatePayment(_action: PaymentAction) {
    if (!this.supported()) {
      paymentActions.submitValidationResult({
        valid: false,
        message: paymentStore.widget.translate('googlePayNotSupported')
      });
    }
  }

  initiatePayment(_action: PaymentAction) {
    const paymentDataRequest = getGooglePaymentDataRequest(this.config);

    return this.paymentsClient.loadPaymentData(paymentDataRequest).catch(this.paymentDataError);
  }

  paymentDataError(error: any) {
    paymentActions.rejectPaymentDetails({
      type: 'cancel',
      data: error
    });
  }

  finalizePayment(action: PaymentAction) {
    const actualPaymentResult = this.paymentResult;
    this.paymentResult = new Deferred<PaymentAuthorizationResult>();

    actualPaymentResult.resolve(
      action.payload.success ? success() : error('googlePayPaymentError')
    );

    return actualPaymentResult;
  }

  createClient() {
    if (this.paymentsClient === undefined) {
      this.paymentsClient = new google.payments.api.PaymentsClient({
        environment: this.config.googlePayEnvironment,
        paymentDataCallbacks: {
          onPaymentAuthorized: this.onPaymentAuthorized.bind(this)
        }
      });
    }
  }

  /**
   * Resolving PaymentDetails state once payment token is available
   */
  submitPaymentDetails(paymentData: PaymentData) {
    paymentActions.submitPaymentDetails({
      type: 'generic',
      customProperties: {
        paymentType: 'googlepay',
        paymentToken: paymentData.paymentMethodData.tokenizationData.token
      }
    });
  }

  onPaymentAuthorized(
    paymentData: PaymentData
  ): Promise<PaymentAuthorizationResult> | PaymentAuthorizationResult {
    this.submitPaymentDetails(paymentData);

    return this.paymentResult;
  }

  addGooglePayButton() {
    const button = this.paymentsClient.createButton({
      onClick: paymentActions.placeOrder
    });

    document.getElementById('googlePayButtonContainer')?.appendChild(button);
  }

  validate(): boolean {
    return this.supported();
  }
}

export default viewModelFactory(PaymentGoogle, template);
