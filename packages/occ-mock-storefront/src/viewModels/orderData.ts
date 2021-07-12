export const shoppingCart = <OCC.ShoppingCart>{
  items: [
    {
      productId: 'testprod123',
      quantity: 2,
      catRefId: 'sku123',
      giftWithPurchaseCommerceItemMarkers: [],
      externalData: [],
      commerceItemId: 'ci3000003'
    }
  ],
  coupons: [],
  orderTotal: 170
};

const shippingAddress = <OCC.OrderDataShippingAddress>{ city: 'mocked_shipping_city' };
const billingAddress = <OCC.OrderDataBillingAddress>{ city: 'mocked_billing_city' };

export default <OCC.OrderData>{
  billingAddress,
  shippingAddress,
  id: 'mocked_id',
  orderProfileId: 'mocked_order_profile_id',
  shippingMethod: 'mocked_shipping_method',
  shoppingCart: shoppingCart
};
