import { Schema } from 'express-validator';
import { isURL } from '@server-extension/controllers/validation/common';

export const schema: Schema = {
  validationUrl: isURL()
};
