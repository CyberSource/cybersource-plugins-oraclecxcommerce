/**
 * Metadata for the getPayerAuthTokenAction action.
 */
export const getPayerAuthTokenAction = {
  name: 'getPayerAuthTokenAction',
  // Action's description
  description: 'Description for getPayerAuthTokenAction',
  author: 'ISV Payments',
  // This action uses a Saga to invoke an endpoint.
  endpoints: ['payerAuthEndpoint'],
  packageId: '@oracle-cx-commerce/core-commerce-reference-store'
};
