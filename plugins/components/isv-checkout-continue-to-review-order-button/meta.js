/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.
 */

import * as resourceBundle from '@oracle-cx-commerce/resources';
import { buildResources } from '@oracle-cx-commerce/resources/utils';
import { mergeDefaultConfig } from '@oracle-cx-commerce/react-widgets/config';
import config from '@oracle-cx-commerce/react-widgets/checkout/checkout-continue-to-review-order-button/config';

const widgetResourceKeys = ['actionContinueToReviewOrder','alertActionCompletedSuccessfully','messageFailed','alertActionCompletedSuccessfully'];

export default {
  name: 'IsvCheckoutContinueToReviewOrderButton',
  packageId: '@oracle-cx-commerce/react-widgets',
  resources: buildResources(resourceBundle, widgetResourceKeys),
  availableToAllPages: false,
  pageTypes: ['checkout-payment'],
  config: mergeDefaultConfig(config),
  actions: ['applyPayments', 'updateAppliedPayment', 'deleteAppliedPayment', 'notifyClearAll', 'notify']
};
