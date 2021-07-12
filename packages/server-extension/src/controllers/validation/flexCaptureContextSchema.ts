import { Schema } from 'express-validator';
import { isURL } from '@server-extension/controllers/validation/common';

export const schema: Schema = {
  targetOrigin: {
    custom: {
      options: (value) =>
        value ? value.startsWith('http://localhost') || value.startsWith('https') : true,
      errorMessage: 'The HTTP protocol is supported only for local development'
    },
    ...isURL(['http', 'https'])
  }
};
