import {
  PaymentMethodViewModel,
  PaymentSelector
} from '@payment-widget/components/PaymentSelector';
import paymentStore from '@payment-widget/store/paymentStore';
import { mockDeep } from 'jest-mock-extended';
import ko from 'knockout';

jest.mock('@payment-widget/store/paymentStore');

const paymentMethod1: OCC.PaymentMethod = {
  type: 'card'
};

const paymentMethod2: OCC.PaymentMethod = {
  type: 'alternative'
};

const deviceFingerprint = mockDeep<OCC.DeviceFingerprintConfig>();

describe('Components - Payment Selector', () => {
  let component: PaymentSelector;
  let paymentMethods: KnockoutObservableArray<PaymentMethodViewModel>;

  beforeEach(() => {
    component = new PaymentSelector({
      config: ko.observable<OCC.PaymentMethodResponse>({
        paymentMethods: [paymentMethod1, paymentMethod2],
        deviceFingerprint: deviceFingerprint
      })
    });
    paymentMethods = component.paymentMethods;
  });

  it('should update list of payment methods on config change', () => {
    expect(paymentMethods().length).toEqual(2);
    expect(paymentMethods()[0].selected()).toBeTruthy();
    expect(paymentMethods()[1].selected()).toBeFalsy();

    expect(paymentStore.selectedPaymentMethod).toBeCalledWith(paymentMethod1);
  });

  it('should only select if currently not selected', () => {
    component.selectMethod(paymentMethods()[1]);

    expect(paymentMethods()[0].selected()).toBeFalsy();
    expect(paymentMethods()[1].selected()).toBeTruthy();
    expect(paymentStore.selectedPaymentMethod).toBeCalledWith(paymentMethod2);
  });
});
