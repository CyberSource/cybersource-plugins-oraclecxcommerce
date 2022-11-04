/**
 * Metadata for the flexMicroformAction action.
 */
export const flexMicroformAction = {
  name: 'flexMicroformAction',
  // Action's description
  description: 'Description for flexMicroformAction',
  author: 'ISV Payments',
  // This action uses a Saga to invoke an endpoint.
  endpoints: ['flexMicroformEndPoint'],
  packageId: '@oracle-cx-commerce/core-commerce-reference-store'
};
