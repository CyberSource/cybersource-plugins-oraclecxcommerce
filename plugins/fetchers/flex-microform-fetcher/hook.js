import {useEffect} from 'react';
import {flexMicroformFetcher} from '..';

/**
 * Custom hook
 *
 * @param {object} store The Store
 * @param {object} widgetConfig The Widget configuration values coming from Design Studio
 */
export default (store, widgetConfig) => {
  useEffect(() => {
    // Detects if the site was populated in the state during server-side rendering
    flexMicroformFetcher(store, {});
  }, [store]);
};
