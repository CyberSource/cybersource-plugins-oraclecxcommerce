import paymentStore from '@payment-widget/store/paymentStore';
import ko from 'knockout';
import CardPaymentController from './cardPaymentController';
import template from './index.html';
import setupPaymentAuthentication from './paymentAuthentication';

/**
 * Will act as a wrapper for the components:
 *  - CreditCardForm
 *  - SavedCardSelector
 *  It's responsible for determining if SavedCards are available and allows switching
 *  between these 2 components
 * @param params
 */
function PaymentCard(params: { config: OCC.Config }) {
  const { payerAuthEnabled, songbirdUrl, flexSdkUrl } = params.config;
  const { creditCardList, cardTypeList } = paymentStore;
  const isUserLoggedIn = paymentStore.isUserLoggedIn();

  const paymentAuthentication = setupPaymentAuthentication({ payerAuthEnabled, songbirdUrl });
  const paymentController = CardPaymentController(paymentAuthentication);
  const isSavedCardSelectorVisible = ko.observable(true);

  const hasSavedCards = ko.pureComputed(() => creditCardList().length > 0, {
    deferEvaluation: true
  });

  isSavedCardSelectorVisible(hasSavedCards());

  function showNewCardForm() {
    isSavedCardSelectorVisible(false);
  }

  function showSavedCardSelector() {
    isSavedCardSelectorVisible(true);
  }

  return {
    flexSdkUrl,
    paymentController,
    cardTypeList,
    creditCardList,
    isUserLoggedIn,
    hasSavedCards,
    isSavedCardSelectorVisible,
    showSavedCardSelector,
    showNewCardForm
  };
}

export default {
  template,
  viewModel: {
    createViewModel: PaymentCard
  }
};
