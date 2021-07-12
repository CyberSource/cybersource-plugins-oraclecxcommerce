import { ParamSchema, Schema } from 'express-validator';
import { URLProtocol } from 'express-validator/src/options';

export * from './checkSchema';

export const isLength = (maxLength: number): ParamSchema => {
  return {
    isLength: {
      options: { max: maxLength },
      errorMessage: `Invalid entry. Please do not exceed the maximum of [${maxLength}] characters.`
    }
  };
};

export const isRequired = {
  notEmpty: {
    options: {
      ignore_whitespace: true
    },
    errorMessage: 'Field is required'
  }
};

export const isDecimal = {
  isDecimal: {
    errorMessage: 'Invalid entry. Field should be a decimal value.'
  }
};

export const is12DigitsNumber = {
  ...isDecimal,
  ...isLength(12)
};

export const isAlphanumeric = {
  isAlphanumeric: {
    errorMessage: 'Invalid entry. Field should be alphanumeric.'
  }
};

export const isOptional = {
  optional: { options: { nullable: true } }
};

export const isNumeric = (
  errorMessage = 'Invalid entry. Should be a valid number.'
): ParamSchema => {
  return {
    isNumeric: {
      options: { no_symbols: false },
      errorMessage: errorMessage
    }
  };
};

export const isURL = (protocols: URLProtocol[] = ['http', 'https', 'ftp']): ParamSchema => {
  return {
    isURL: {
      errorMessage: 'Invalid entry. Field must be a valid URL.',
      options: {
        protocols: protocols,
        require_protocol: true,
        require_tld: false,
        require_host: true,
        require_valid_protocol: true
      }
    }
  };
};

export const isInt = {
  isInt: {
    errorMessage: 'Invalid entry. Should be an integer number.'
  }
};

export const isEmail = {
  isEmail: {
    errorMessage: 'Invalid entry. Please enter valid email address, for example: john@smith.com.'
  }
};

export const isArray = (
  errorMessage = 'Invalid entry. Array of entries expected.'
): ParamSchema => {
  return {
    isArray: {
      errorMessage: errorMessage
    }
  };
};

export const isCurrencyCode: ParamSchema = {
  ...isLength(3),
  isAlpha: {
    errorMessage: 'Invalid entry. Currency code should contain alphabetical characters only.'
  },
  isUppercase: {
    errorMessage: 'Invalid entry. Currency code should contain uppercase characters only.'
  }
};

export const isOptionalNumeric = (errorMessage: string) => {
  return {
    ...isOptional,
    optional: {
      options: { checkFalsy: true }
    },
    ...isNumeric(errorMessage)
  };
};

export const addressValidation = (addressType: string) => {
  const isRequiredLength = (max: number) => {
    return { ...isRequired, ...isLength(max) };
  };

  const isOptionalEmail = {
    ...isOptional,
    ...isEmail
  };

  return <Schema>{
    [addressType]: isOptional,
    [`${addressType}.firstName`]: isRequiredLength(60),
    [`${addressType}.lastName`]: isRequiredLength(60),
    [`${addressType}.country`]: isRequiredLength(60),
    [`${addressType}.postalCode`]: isRequiredLength(10),
    [`${addressType}.address1`]: isRequiredLength(60),
    [`${addressType}.address2`]: isLength(60),
    [`${addressType}.city`]: isRequiredLength(50),
    [`${addressType}.state`]: isOptional,
    [`${addressType}.phoneNumber`]: isOptionalNumeric(
      'Invalid entry. Should be a valid phone number.'
    ),
    [`${addressType}.email`]: isOptionalEmail
  };
};

export const isDate = {
  isISO8601: {
    errorMessage: 'Invalid entry. Should be a date.'
  }
};
