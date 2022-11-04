import {useEffect} from 'react';
import {isEmptyObject} from '@oracle-cx-commerce/utils/generic';
import {paymentMethodConfigFetcher} from '..';
import {getPaymentMethodConfigRepository} from '../../selectors';

/**
 * Custom hook
 *
 * @param {object} store The Store
 * @param {object} widgetConfig The Widget configuration values coming from Design Studio
 */
export default (store, widgetConfig) => {
  useEffect(() => {
    // Detects if the site was populated in the state during server-side rendering
    if (isEmptyObject(getPaymentMethodConfigRepository(store.getState()))) {
      paymentMethodConfigFetcher(store, {});
    }
  }, [store]);
};
