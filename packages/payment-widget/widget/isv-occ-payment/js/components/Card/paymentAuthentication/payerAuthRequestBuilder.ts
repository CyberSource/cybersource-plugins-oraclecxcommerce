import paymentStore from '@payment-widget/store/paymentStore';
import ko from 'knockout';

const mapAddress = (address: OCC.Address, addressType: string) => {
  return (
    address.isValid() && {
      [addressType]: address
    }
  );
};

const mapOrderId = () => {
  const { user, cart } = paymentStore.widget;
  const userOrderId = cart().nonTransientCartCheck() && user().loggedIn() && user().orderId();
  const orderId = userOrderId || cart().currentOrderId();

  return (
    orderId && {
      orderId
    }
  );
};

export const getOrderData = () => {
  const { order, cart } = paymentStore.widget;

  const { shippingAddress, billingAddress } = order();
  const { currencyCode, total } = cart();

  return ko.toJS({
    currencyCode,

    ...mapOrderId(),
    ...mapAddress(shippingAddress(), 'shippingAddress'),
    ...mapAddress(billingAddress(), 'billingAddress'),

    shoppingCart: {
      orderTotal: total,
      items: cart()
        .items()
        .map(({ productId, quantity }) => ({
          productId,
          quantity
        }))
    }
  });
};
