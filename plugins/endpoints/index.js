/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.
 */

export * from '@oracle-cx-commerce/endpoints';
export * from '@oracle-cx-commerce/oce-endpoints';
export const flexMicroformEndpoint = () => import('./flex-microform-endpoint');
export const paymentMethodConfigEndpoint = () => import('./payment-method-config-endpoint');
export const payerAuthEndpoint = () => import('./payer-auth-endpoint');
export const applePayValidationEndpoint = () => import('./apple-pay-validation-endpoint');
