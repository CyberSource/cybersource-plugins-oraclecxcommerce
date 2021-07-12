import { alertMessages } from '@isv-occ-payment/occ-mock-storefront/src/ccLogger';

export default {
  messages: alertMessages,

  clearMessages() {
    alertMessages([]);
  }
};
