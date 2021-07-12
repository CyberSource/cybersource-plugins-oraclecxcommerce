import paymentStore from '@payment-widget/store/paymentStore';
import ko from 'knockout';
import template from './index.html';

export class PaymentMethodViewModel {
  selected = ko.observable(false);
  paymentMethod: OCC.PaymentMethod;

  constructor(paymentMethod: OCC.PaymentMethod) {
    this.paymentMethod = paymentMethod;
  }
}

const createViewModels = (paymentMethods: OCC.PaymentMethod[]) =>
  paymentMethods.map((method) => new PaymentMethodViewModel(method));

interface PaymentSelectorParams {
  config: KnockoutObservable<OCC.PaymentMethodResponse>;
}

export class PaymentSelector {
  paymentMethods = ko.observableArray<PaymentMethodViewModel>([]);

  constructor(params: PaymentSelectorParams) {
    const viewModels = createViewModels(params.config().paymentMethods);

    this.paymentMethods(viewModels);
    this.selectMethod(viewModels[0]);
  }

  selectMethod(vm: PaymentMethodViewModel) {
    if (!vm.selected()) {
      this.paymentMethods().forEach((paymentMethod) => paymentMethod.selected(paymentMethod == vm));

      // Update global state so that application logic becomes aware of current selected payment component
      paymentStore.selectedPaymentMethod(vm.paymentMethod);
    }
  }
}

export default {
  viewModel: PaymentSelector,
  template: template
};
