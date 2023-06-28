/**
 * Metadata for the getPayerAuthSetupAction action.
 */
export const getPayerAuthSetupAction = {
  name: 'getPayerAuthSetupAction',
  // Action's description
  description: 'Description for getPayerAuthSetupAction',
  author: 'ISV Payments',
  // This action uses a Saga to invoke an endpoint.
  endpoints: ['payerAuthSetupEndpoint'],
  packageId: '@oracle-cx-commerce/core-commerce-reference-store'
};
