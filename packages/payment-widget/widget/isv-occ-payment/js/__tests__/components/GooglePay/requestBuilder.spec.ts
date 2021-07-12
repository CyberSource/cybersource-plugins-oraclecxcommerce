import {
  getGoogleTransactionInfo,
  getAllowedCardNetworks
} from '@payment-widget/components/GooglePay/requestBuilder';
import paymentStore from '@payment-widget/store/paymentStore';
import ko from 'knockout';
import { mock } from 'jest-mock-extended';

jest.mock('@payment-widget/store/paymentStore');

describe('getGoogleTransactionInfo', () => {
  let cart: OCC.Cart;
  let order: OCC.Order;
  let billingAddress: OCC.Address;
  let widget: OCC.WidgetViewModel;
  const config: OCC.Config = mock<OCC.Config>();

  beforeEach(() => {
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
      order: ko.observable(order)
    };

    paymentStore.order = widget.order;
    paymentStore.widget = widget;
  });

  it('should provide transaction info', async () => {
    const result = getGoogleTransactionInfo();

    expect(result).toMatchObject({
      displayItems: [
        { label: 'subtotalLabel', type: 'SUBTOTAL', price: '130' },
        { label: 'shippingLabel', type: 'LINE_ITEM', price: '10' },
        { label: 'taxLabel', type: 'TAX', price: '0' },
        { label: 'discountsLabel', type: 'LINE_ITEM', price: '-13' }
      ],
      countryCode: 'US',
      currencyCode: 'USD',
      totalPriceStatus: 'FINAL',
      totalPrice: '127',
      totalPriceLabel: 'totalLabel'
    });
  });

  it('should not add discounts entry if quantity = 0', async () => {
    cart.orderDiscount(0);

    const result = getGoogleTransactionInfo();

    expect(result).toMatchObject({
      displayItems: [
        { label: 'subtotalLabel', type: 'SUBTOTAL', price: '130' },
        { label: 'shippingLabel', type: 'LINE_ITEM', price: '10' },
        { label: 'taxLabel', type: 'TAX', price: '0' }
      ],
      countryCode: 'US',
      currencyCode: 'USD',
      totalPriceStatus: 'FINAL',
      totalPrice: '127',
      totalPriceLabel: 'totalLabel'
    });
  });

  it('should provide array with allowed networks', async () => {
    config.googlePaySupportedNetworks = 'AMEX,DISCOVER, INTERAC, JCB,MASTERCARD,VISA';

    const result = getAllowedCardNetworks(config);

    expect(result).toMatchObject(['AMEX', 'DISCOVER', 'INTERAC', 'JCB', 'MASTERCARD', 'VISA']);
  });
});
