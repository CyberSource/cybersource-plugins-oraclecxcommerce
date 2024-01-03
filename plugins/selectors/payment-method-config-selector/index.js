import { getPaymentConfigurations } from '@oracle-cx-commerce/commerce-utils/selector';
import { PAYMENT_TYPE_GENERIC } from '@oracle-cx-commerce/commerce-utils/constants';

export const getPaymentMethodConfigRepository = state => {
  const paymentMethods = getPaymentConfigurations(state).paymentMethods || [];
  const paymentConfiguration = state.paymentMethodConfigRepository || {};

  return {
    isGenericPaymentEnabled: paymentMethods.findIndex(paymentMethod => paymentMethod === PAYMENT_TYPE_GENERIC) > -1,
    ...paymentConfiguration
  }
};
