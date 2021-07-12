import paymentStore from '@payment-widget/store/paymentStore';
import ko from 'knockout';
import occClient from '../services/occClient';
import paymentActions from '../store/paymentActions';
import paymentApplePay from './ApplePay';
import paymentCard from './Card';
import deviceFingerprint from './DeviceFingerprint';
import paymentGooglePay from './GooglePay';
import paymentSelector from './PaymentSelector';
import creditCardForm from './Card/CreditCardForm';
import savedCardSelector from './Card/SavedCardSelector';

ko.components.register('payment-selector', paymentSelector);
ko.components.register('payment-method-card', paymentCard);
ko.components.register('payment-method-googlepay', paymentGooglePay);
ko.components.register('payment-method-applepay', paymentApplePay);
ko.components.register('device-fingerprint', deviceFingerprint);
ko.components.register('credit-card-form', creditCardForm);
ko.components.register('saved-card-selector', savedCardSelector);

function loadPaymentMethods() {
  return occClient
    .loadPaymentMethods()
    .then((paymentMethodsResponse) => paymentActions.updatePaymentMethods(paymentMethodsResponse));
}

function loadCreditCardList() {
  if (paymentStore.isUserLoggedIn()) {
    return occClient
      .getCreditCardsForProfile()
      .then((creditCards) => paymentActions.updateCreditCardList(creditCards));
  }

  paymentActions.updateCreditCardList([]);
  return Promise.resolve();
}

export default {
  /**
   * Is run once any re-population of mapping data has occurred.
   * This can be useful when a Web API call is required every time the widget is shown,
   * or, some other functionality required every time the widget is shown
   */
  beforeAppear() {
    paymentActions.invalidate();
    this.updateComponentsData();
  },

  updateComponentsData() {
    paymentStore.isLoading(true);

    Promise.all([loadPaymentMethods(), loadCreditCardList()]).then(function () {
      paymentStore.isLoading(false);
    });
  }
};
