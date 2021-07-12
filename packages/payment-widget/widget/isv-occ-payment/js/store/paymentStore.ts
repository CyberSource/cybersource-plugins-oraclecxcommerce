import { Deferred } from '@payment-widget/common/deferred';
import ccRestClient from 'ccRestClient';
import ko from 'knockout';
import { PaymentDetails } from './common';

export class PaymentStore {
  widget!: OCC.WidgetViewModel;
  order!: KnockoutObservable<OCC.Order>;

  selectedPaymentMethod = ko.observable<OCC.PaymentMethod | undefined>();
  paymentActions = ko.observableArray();
  paymentDetails = new Deferred<PaymentDetails>();
  paymentInProgress = ko.observable(false);

  validationResults = ko.observableArray();

  creditCardList = ko.observableArray(<OCC.SavedCardList>[]);
  config = ko.observable<OCC.PaymentMethodResponse>();
  isLoading = ko.observable(true);

  init(viewModel: OCC.WidgetViewModel) {
    this.widget = viewModel;
    this.order = viewModel.order;
  }

  resetState() {
    this.validationResults([]);
    this.paymentActions([]);
    this.creditCardList([]);
  }

  get cardTypeList() {
    return this.order().contextData.page.payment.cards;
  }

  isUserLoggedIn() {
    return ccRestClient.loggedIn;
  }
}

export default new PaymentStore();
