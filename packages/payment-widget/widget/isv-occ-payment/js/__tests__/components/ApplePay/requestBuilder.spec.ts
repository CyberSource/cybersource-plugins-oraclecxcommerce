import { getPaymentRequestData } from '@payment-widget/components/ApplePay/requestBuilder';
import paymentStore from '@payment-widget/store/paymentStore';
import ko from 'knockout';
import { mock } from 'jest-mock-extended';

jest.mock('@payment-widget/store/paymentStore');

describe('getPaymentRequestData', () => {
  let cart: OCC.Cart;
  let order: OCC.Order;
  let billingAddress: OCC.Address;
  let widget: OCC.WidgetViewModel;
  const config: OCC.Config = mock<OCC.Config>();

  beforeEach(() => {
    config.applePaySupportedNetworks = 'visa,masterCard ,amex, discover';

    cart = <OCC.Cart>{
      total: ko.observable(127),
      currencyCode: ko.observable('USD'),
      subTotal: ko.observable(130),
      orderDiscount: ko.observable(13),
      tax: ko.observable(0),
      shipping: ko.observable(10)
    };

    billingAddress = <OCC.Address>{
      selectedCountry: ko.observable('US')
    };

    order = <OCC.Order>{
      cart: ko.observable(cart),
      billingAddress: ko.observable(billingAddress)
    };

    widget = <OCC.WidgetViewModel>{
      translate: (key: string) => key,
      order: ko.observable(order),
      cart: ko.observable(cart)
    };

    paymentStore.order = widget.order;
    paymentStore.widget = widget;
  });

  it('should provide payment request data', async () => {
    const result = getPaymentRequestData(config);

    expect(result).toMatchObject({
      lineItems: [
        { label: 'subtotalLabel', type: 'final', amount: '130' },
        { label: 'shippingLabel', type: 'final', amount: '10' },
        { label: 'taxLabel', type: 'final', amount: '0' },
        { label: 'discountsLabel', type: 'final', amount: '-13' }
      ],
      countryCode: 'US',
      currencyCode: 'USD',
      supportedNetworks: ['visa', 'masterCard', 'amex', 'discover'],
      merchantCapabilities: ['supports3DS'],
      total: { label: 'totalLabel', amount: '127', type: 'final' }
    });
  });

  it('should not add discounts entry if quantity = 0', async () => {
    cart.orderDiscount(0);

    const result = getPaymentRequestData(config);

    expect(result).toMatchObject({
      lineItems: [
        { label: 'subtotalLabel', type: 'final', amount: '130' },
        { label: 'shippingLabel', type: 'final', amount: '10' },
        { label: 'taxLabel', type: 'final', amount: '0' }
      ],
      countryCode: 'US',
      currencyCode: 'USD',
      supportedNetworks: ['visa', 'masterCard', 'amex', 'discover'],
      merchantCapabilities: ['supports3DS'],
      total: { label: 'totalLabel', amount: '127', type: 'final' }
    });
  });
});
