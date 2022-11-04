/** Error handler
 * @module payment
 */

/**
 * @const
 */
const {
  apiErrorResponse
} = require('@server-extension/services/payments/converters/response/errors/apiCardError');
const {
  apiGenericErrorResponse
} = require('@server-extension/services/payments/converters/response/errors/apiGenericError');
const { Constants } = require('@isv-occ-payment/occ-payment-service/cjs/constants');

/**
 * Handle error
 * @param {Object} error - Error
 * @param {Object} req - Transaction request
 */
async function errorHandler(error, req) {
  switch (req.params.paymentType) {
    case Constants.CARD:
      return apiErrorResponse(error, req);
    case Constants.GENERIC:
      return apiGenericErrorResponse(error, req);
    default:
      throw error;
  }
}

module.exports.errorHandler = errorHandler;
