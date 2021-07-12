import paymentStore from '../../store/paymentStore';

export const getPaymentRequestData = (config: OCC.Config) => {
  const { order, cart } = paymentStore.widget;

  const countryCode = order().billingAddress().selectedCountry();
  const currencyCode = cart().currencyCode();

  return {
    countryCode: countryCode,
    currencyCode,
    supportedNetworks: config.applePaySupportedNetworks.split(',').map((network) => network.trim()),
    merchantCapabilities: ['supports3DS'],
    total: {
      label: paymentStore.widget.translate('totalLabel'),
      amount: String(cart().total()),
      type: 'final'
    },
    lineItems: getLineItems(cart())
  };

  function getLineItems(cart: OCC.Cart): any {
    const items = [
      {
        label: paymentStore.widget.translate('subtotalLabel'),
        type: 'final',
        amount: String(cart.subTotal())
      },
      {
        label: paymentStore.widget.translate('shippingLabel'),
        type: 'final',
        amount: String(cart.shipping())
      },
      {
        label: paymentStore.widget.translate('taxLabel'),
        type: 'final',
        amount: String(cart.tax())
      }
    ];

    if (cart.orderDiscount()) {
      items.push({
        label: paymentStore.widget.translate('discountsLabel'),
        type: 'final',
        amount: String(cart.orderDiscount() * -1)
      });
    }

    return items;
  }
};
