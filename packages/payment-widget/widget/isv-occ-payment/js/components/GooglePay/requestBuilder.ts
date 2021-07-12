import paymentStore from '@payment-widget/store/paymentStore';

type TransactionInfo = google.payments.api.TransactionInfo;
type PaymentDataRequest = google.payments.api.PaymentDataRequest;
type IsReadyToPayRequest = google.payments.api.IsReadyToPayRequest;
type DisplayItems = google.payments.api.DisplayItem[];
type IsReadyToPayPaymentMethodSpecification = google.payments.api.IsReadyToPayPaymentMethodSpecification;
type CardNetwork = google.payments.api.CardNetwork;

const baseRequest = {
  apiVersion: 2,
  apiVersionMinor: 0
};

const baseCardPaymentMethod = (config: OCC.Config): IsReadyToPayPaymentMethodSpecification => {
  return {
    type: 'CARD',
    parameters: {
      allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
      allowedCardNetworks: getAllowedCardNetworks(config)
    }
  };
};

export const getAllowedCardNetworks = (config: OCC.Config): CardNetwork[] =>
  config.googlePaySupportedNetworks.split(',').map((network) => network.trim()) as CardNetwork[];

const translate = (key: string) => paymentStore.widget.translate(key);

export const getGoogleTransactionInfo = (): TransactionInfo => {
  const cart = paymentStore.order().cart();
  return {
    displayItems: getDisplayItems(cart),
    countryCode: paymentStore.order().billingAddress().selectedCountry(),
    currencyCode: cart.currencyCode(),
    totalPriceStatus: 'FINAL',
    totalPrice: String(cart.total()),
    totalPriceLabel: translate('totalLabel')
  };
};

function getDisplayItems(cart: OCC.Cart): DisplayItems {
  const items: DisplayItems = [
    {
      label: translate('subtotalLabel'),
      type: 'SUBTOTAL',
      price: String(cart.subTotal())
    },
    {
      label: translate('shippingLabel'),
      type: 'LINE_ITEM',
      price: String(cart.shipping())
    },
    {
      label: translate('taxLabel'),
      type: 'TAX',
      price: String(cart.tax())
    }
  ];

  if (cart.orderDiscount()) {
    items.push({
      label: translate('discountsLabel'),
      type: 'LINE_ITEM',
      price: String(cart.orderDiscount() * -1)
    });
  }

  return items;
}

export const getGoogleIsReadyToPayRequest = (config: OCC.Config): IsReadyToPayRequest => {
  return {
    ...baseRequest,
    allowedPaymentMethods: [baseCardPaymentMethod(config)]
  };
};

export const getGooglePaymentDataRequest = (config: OCC.Config): PaymentDataRequest => {
  return {
    ...baseRequest,
    allowedPaymentMethods: [
      {
        ...baseCardPaymentMethod(config),

        tokenizationSpecification: {
          type: 'PAYMENT_GATEWAY',
          parameters: {
            gateway: config.googlePayGateway,
            gatewayMerchantId: config.googlePayGatewayMerchantId
          }
        }
      }
    ],
    transactionInfo: getGoogleTransactionInfo(),
    merchantInfo: {
      merchantId: config.googlePayMerchantId,
      merchantName: config.googlePayMerchantName
    },
    callbackIntents: ['PAYMENT_AUTHORIZATION']
  };
};
