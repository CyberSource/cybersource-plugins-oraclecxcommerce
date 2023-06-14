import defaultConfig from '@oracle-cx-commerce/react-widgets/config';
import * as resourceBundle from '@oracle-cx-commerce/resources';
import {buildResources} from '@oracle-cx-commerce/resources/utils';

const widgetResourceKeys = [
  'buttonPlaceOrder',
  'buttonPlacingOrder',
  'alertTechnicalProblemContactUs',
  'alertOrderNotPlacedPaymentDeclined',
  'buttonScheduledOrder',
  'buttonSchedulingOrder',
  'headingPayment',
  'messageFailed',
  'alertActionCompletedSuccessfully'
];

export default {
  name: 'IsvCheckoutPlaceOrderButton',
  decription: 'Description of widget IsvCheckoutPlaceOrderButton',
  author: 'ISV Payment',
  fetchers: [],
  actions: [],
  resources: buildResources(resourceBundle, widgetResourceKeys),
  config: defaultConfig,
  pageTypes: ['checkout-review-order']
};
