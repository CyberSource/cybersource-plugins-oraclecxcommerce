import { Deferred } from '@payment-widget/common/deferred';
import { PaymentDetails, PAYMENT_METHOD_TYPE, RejectedPaymentDetails } from './common';
import paymentStore from './paymentStore';

export type ACTION_TYPE =
  | 'initiate'
  | 'validate'
  | 'finalize'
  | 'validateConsumerAuthentication'
  | 'decoratePaymentDetails';

export type PaymentAction = {
  type: ACTION_TYPE;
  paymentMethod: PAYMENT_METHOD_TYPE;
  payload?: any;
};

type PaymentActionChanges = KnockoutArrayChange<PaymentAction>[];
type PaymentActionPredicate = (action: PaymentAction) => boolean;
type PaymentActionCallback = (action: PaymentAction) => void;

// List of action which will reset payment details
const PAYMENT_DETAILS_ACTIONS = ['initiate', 'finalize', 'validateConsumerAuthentication'];

const resetPaymentDetails = (action: ACTION_TYPE) => {
  if (PAYMENT_DETAILS_ACTIONS.includes(action)) {
    paymentStore.paymentDetails = new Deferred<any>();
  }
};

export const paymentActionFilter = (paymentMethod: PAYMENT_METHOD_TYPE, action: ACTION_TYPE) => (
  paymentAction: PaymentAction
) => paymentAction.type == action && paymentAction.paymentMethod == paymentMethod;

const subscriptions: KnockoutSubscription[] = [];

export default {
  placeOrder() {
    paymentStore.order().handlePlaceOrder();
  },

  initiatePayment() {
    this.submitPaymentAction({
      type: 'initiate',
      paymentMethod: this.selectedPaymentMethod
    });

    paymentStore.paymentInProgress(true);
  },

  updatePaymentMethods(paymentMethodsResponse: OCC.PaymentMethodResponse) {
    paymentStore.config(paymentMethodsResponse);
  },

  updateCreditCardList(creditCards: OCC.SavedCardList) {
    paymentStore.creditCardList(creditCards);
  },

  nextPaymentAction(paymentResponse: any) {
    this.submitPaymentAction({
      type: paymentResponse.customPaymentProperties.action,
      paymentMethod: this.selectedPaymentMethod,
      payload: paymentResponse.customPaymentProperties
    });
  },

  finalizePayment(payload: any) {
    this.submitPaymentAction({
      type: 'finalize',
      paymentMethod: this.selectedPaymentMethod,
      payload
    });

    paymentStore.paymentInProgress(false);
  },

  onPaymentFailed(_error: any) {
    paymentStore.paymentInProgress(false);
  },

  submitPaymentAction(action: PaymentAction) {
    resetPaymentDetails(action.type);
    paymentStore.paymentActions.push(action);
  },

  submitPaymentDetails(paymentDetails: PaymentDetails) {
    this.submitPaymentAction({
      type: 'decoratePaymentDetails',
      paymentMethod: this.selectedPaymentMethod,
      payload: paymentDetails
    });
    paymentStore.paymentDetails.resolve(paymentDetails);
  },

  rejectPaymentDetails(paymentDetails: RejectedPaymentDetails) {
    paymentStore.paymentDetails.reject(paymentDetails);
  },

  validatePayment() {
    paymentStore.validationResults([]);

    this.submitPaymentAction({
      type: 'validate',
      paymentMethod: this.selectedPaymentMethod
    });
  },

  submitValidationResult(result: any) {
    paymentStore.validationResults.push(result);
  },

  takePaymentAction(predicate: PaymentActionPredicate, callback: PaymentActionCallback) {
    const subscription = paymentStore.paymentActions.subscribe(
      (changes: PaymentActionChanges) => {
        const matchingAction = changes.find(
          (change) => change.status == 'added' && predicate(change.value)
        );

        if (matchingAction) {
          callback(matchingAction.value);
        }
      },
      this,
      'arrayChange'
    );
    subscriptions.push(subscription);
    return subscription;
  },

  takePaymentDetails(): Promise<PaymentDetails> {
    return paymentStore.paymentDetails;
  },

  invalidate() {
    paymentStore.resetState();
    subscriptions.forEach((subscription) => subscription.dispose());
  },

  get selectedPaymentMethod() {
    return <PAYMENT_METHOD_TYPE>paymentStore.selectedPaymentMethod()?.type;
  }
};
