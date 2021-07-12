import $ from 'jquery';
import ko from 'knockout';
import ccLogger from '../ccLogger';
import ccRestClient from '../ccRestClient';
import pubsub from '../pubsub';
import widget from '../widget';
import address from './address';
import defaultCart from './cart';
import contextData from './contextData';
import mockedOrder from './orderData';

export function getOrderPayload() {
  const order = widget.order;

  const { id, op, shippingAddress, billingAddress, payments } = order();

  const { orderProfileId, shippingMethod, shoppingCart } = order().order();

  return {
    billingAddress: billingAddress(),
    op,
    id,
    payments: payments(),
    profileId: orderProfileId,
    shippingAddress: shippingAddress(),
    shippingMethod,
    shoppingCart
  };
}

export default ko.observable(<OCC.Order>{
  id: ko.observable('o30039'),
  op: ko.observable('complete'),
  shippingAddress: ko.observable(address),
  billingAddress: ko.observable(address),
  cart: defaultCart,
  paymentGateway: ko.observable({ type: 'isv-occ-gateway' }),
  payments: ko.observableArray(),
  order: ko.observable(mockedOrder),
  checkoutLink: '/checkout',
  enableOrderButton: ko.observable(true),
  errorFlag: false,
  contextData: contextData,
  validationCallbacks: ko.observableArray<OCC.ValidationCallback>(),

  addValidationCallback: function (callback: OCC.ValidationCallback) {
    this.validationCallbacks.push(callback);
  },

  triggerValidationCallbacks: function () {
    this.validationCallbacks().forEach((callback) => callback());
  },

  addValidationError: function (messageId: string, message: string) {
    this.errorFlag = true;
    ccLogger.error(message);
  },

  handlePlaceOrder: function () {
    ccLogger.info('>>> orderViewModel: handlePlaceOrder');

    this.errorFlag = false;
    this.enableOrderButton(false);

    this.triggerValidationCallbacks();

    if (!this.errorFlag) {
      this.createOrder();
    }

    this.enableOrderButton(true);
  },

  createOrder: function () {
    const orderPayload = ko.toJS(getOrderPayload());
    ccLogger.info('>>> Creating order with payments:', orderPayload.payments);

    ccRestClient.request(
      'createOrder',
      orderPayload,
      this.postOrderCreateOrUpdateSuccess,
      this.postOrderCreateOrUpdateFailure
    );
  },

  postOrderCreateOrUpdateSuccess: (data: any) => {
    $.Topic(pubsub.topicNames.ORDER_COMPLETED).publish({
      message: 'success',
      id: data.id,
      uuid: data.uuid,
      payment: data.payments
    });
  },

  postOrderCreateOrUpdateFailure: (data: any) => {
    $.Topic(pubsub.topicNames.ORDER_SUBMISSION_FAIL).publish({
      message: 'fail',
      data: data
    });
  },

  updatePayments: function (payments: any[]) {
    this.payments(payments);
  }
});
