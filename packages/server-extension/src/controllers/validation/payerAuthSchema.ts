import {
  addressValidation,
  isArray,
  isCurrencyCode,
  isInt,
  isNumeric,
  isOptional,
  isRequired
} from '@server-extension/controllers/validation/common';
import { Schema } from 'express-validator';

export const schema: Schema = {
  orderId: {
    ...isOptional,
    escape: true
  },
  currencyCode: isCurrencyCode,
  'shoppingCart.items': isArray('Invalid entry. List of shopping cart items is empty.'),
  'shoppingCart.orderTotal': isNumeric(),
  'shoppingCart.items[*].productId': isRequired,
  'shoppingCart.items[*].quantity': isInt,
  ...addressValidation('billingAddress'),
  ...addressValidation('shippingAddress')
};
