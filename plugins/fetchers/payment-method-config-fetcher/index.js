import {getGlobalContext} from '@oracle-cx-commerce/commerce-utils/selector';
/**
 * Custom Fetcher
 *
 * @param {object} store  The Store
 * @param {object} widgetConfig  The widget configuration values coming from Design Studio
 */
export default (store, widgetConfig) => {
  const {isPreview} = getGlobalContext(store.getState());
  return store.endpoint('paymentMethodConfigEndpoint', {isPreview});
};
