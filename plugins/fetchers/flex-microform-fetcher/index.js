/**
 * Custom Fetcher
 *
 * @param {object} store  The Store
 * @param {object} widgetConfig  The widget configuration values coming from Design Studio
 */
export default (store, widgetConfig) => {
  return store.endpoint('flexMicroformEndpoint', {});
};
