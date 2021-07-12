import ko from 'knockout';

export default ko.observable(<OCC.Cart>{
  combineLineItems: 'true',
  currencyCode: ko.observable('USD'),
  amount: ko.observable('170'),
  total: ko.observable(127),
  subTotal: ko.observable(130),
  tax: ko.observable(0),
  shipping: ko.observable(10),
  orderDiscount: ko.observable(13),
  currentOrderId: ko.observable(''),
  nonTransientCartCheck: ko.observable(true),

  items: ko.observableArray([
    {
      productId: 'testprod123',
      quantity: 2
    }
  ])
});
