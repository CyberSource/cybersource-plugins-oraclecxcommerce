/**
 * Metadata for the applePayValidationAction action.
 */
export const applePayValidationAction = {
  name: 'applePayValidationAction',
  // Action's description
  description: 'Description for applePayValidationAction',
  author: 'ISV Payments',
  // This action uses a Saga to invoke an endpoint.
  endpoints: ['applePayValidationEndpoint'],
  packageId: '@oracle-cx-commerce/core-commerce-reference-store'
};
