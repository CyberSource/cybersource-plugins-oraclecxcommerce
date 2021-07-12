import { alertMessages } from '@isv-occ-payment/occ-mock-storefront/src/ccLogger';
import paymentActions from '../store/paymentActions';

export default {
  messages: alertMessages,

  clearMessages() {
    alertMessages([]);
  },

  placeOrder() {
    paymentActions.placeOrder();
  }
};
