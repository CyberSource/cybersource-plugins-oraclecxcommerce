import occClient from '@payment-widget/services/occClient';
import paymentActions, {
  ACTION_TYPE,
  PaymentAction,
  paymentActionFilter
} from '@payment-widget/store/paymentActions';
import ccLogger from 'ccLogger';
import ko from 'knockout';
import { PaymentViewModel, viewModelFactory } from '../viewModelFactory';
import template from './index.html';
import { getPaymentRequestData } from './requestBuilder';
import paymentStore from '@payment-widget/store/paymentStore';

declare global {
  interface Window {
    ApplePaySession: ApplePaySession;
  }
}

const actionFilter = (action: ACTION_TYPE) => paymentActionFilter('applepay', action);

export class PaymentApple implements PaymentViewModel {
  paymentsClient!: google.payments.api.PaymentsClient;
  session!: ApplePaySession;

  loading = ko.observable(true);
  supported = ko.observable(false);

  config: OCC.Config;

  constructor(params: any) {
    this.config = params.config;
  }

  initialize() {
    this.loading(true);

    this.supported(this.canMakePayments());

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
        message: paymentStore.widget.translate('applePayNotSupported')
      });
    }
  }

  initiatePayment(_action: PaymentAction) {
    this.createSession().begin();
  }

  finalizePayment(action: PaymentAction) {
    const status = action.payload.success
      ? ApplePaySession.STATUS_SUCCESS
      : ApplePaySession.STATUS_FAILURE;

    if (status == ApplePaySession.STATUS_FAILURE) {
      ccLogger.error('An error occurred while creating order using ApplePay payment data');
    }

    this.session.completePayment(status);
  }

  createSession() {
    this.session = new ApplePaySession(3, getPaymentRequestData(this.config));

    this.session.onvalidatemerchant = this.onValidateMerchant.bind(this);
    this.session.onpaymentauthorized = this.onPaymentAuthorized.bind(this);
    this.session.oncancel = this.onCancel.bind(this);

    return this.session;
  }

  triggerPayment() {
    paymentActions.placeOrder();
  }

  async onValidateMerchant(event: ApplePayJS.ApplePayValidateMerchantEvent) {
    try {
      const merchSession = await occClient.createApplePaySession(event.validationURL);
      this.session.completeMerchantValidation(merchSession);
    } catch (err) {
      // In case of error ApplePay automatically sends 'oncancel' event and closes the sheet (popup)
      ccLogger.error('An error occurred while validation ApplePay session', err);
    }
  }

  onPaymentAuthorized(event: ApplePayJS.ApplePayPaymentAuthorizedEvent) {
    paymentActions.submitPaymentDetails({
      type: 'generic',
      customProperties: {
        paymentType: 'applepay',
        paymentToken: JSON.stringify(event.payment.token.paymentData)
      }
    });
  }

  onCancel(_event: ApplePayJS.Event) {
    paymentActions.rejectPaymentDetails({
      type: 'cancel'
    });
  }

  canMakePayments(): boolean {
    return window.ApplePaySession && ApplePaySession.canMakePayments();
  }

  validate(): boolean {
    return this.supported();
  }
}

export default viewModelFactory(PaymentApple, template);
