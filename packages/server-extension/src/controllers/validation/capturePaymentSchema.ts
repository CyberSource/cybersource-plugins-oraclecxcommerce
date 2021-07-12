import {
  is12DigitsNumber,
  isAlphanumeric,
  isCurrencyCode,
  isRequired
} from '@server-extension/controllers/validation/common';
import { Schema } from 'express-validator';

export const schema: Schema = {
  currency: isCurrencyCode,
  transactionId: {
    ...isRequired,
    escape: true
  },
  amount: is12DigitsNumber,
  merchantReferenceNumber: {
    ...isAlphanumeric,
    escape: true
  }
};
