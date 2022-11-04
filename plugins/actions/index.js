/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.
 */

export * from '@oracle-cx-commerce/actions';

export const flexMicroformAction = () => import('./flex-microform-action');
export const getPayerAuthTokenAction = () => import('./get-payer-auth-token-action');
export const applePayValidationAction = () => import('./apple-pay-validation-action');