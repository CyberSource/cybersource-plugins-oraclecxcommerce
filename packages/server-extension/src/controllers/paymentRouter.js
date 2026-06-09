/** Payment route handler
 * @module payment
 * @requires module:@isv-occ-payment/occ-payment-factory#ServiceFactory
 * @requires module:error#BadRequestError
 */
/**
 * @const
 */
const { ServiceFactory, LogFactory } = require('@isv-occ-payment/occ-payment-factory');
const { errorHandler } = require('../errors/handlers/errorHandler');
const logger = LogFactory.logger();
/**
 * Allowlist of valid payment types to prevent module injection attacks
 * Only these payment methods are allowed to be loaded as modules
 */
const ALLOWED_PAYMENT_TYPES = new Set([
  'applepay',
  'card',
  'generic',
  'googlepay'
]);

/**
 * Allowlist of valid complete module paths to prevent RCE via require()
 *This prevents attackers from loading arbitrary modules like 'child_process' or '../../../malicious'
 */
const ALLOWED_MODULES = new Set([
  '@isv-occ-payment/applepay-payment-service',
  '@isv-occ-payment/card-payment-service',
  '@isv-occ-payment/generic-payment-service',
  '@isv-occ-payment/googlepay-payment-service'
]);

/**
 * Validates payment type against allowlist to prevent module injection
 * @param {string} paymentType - Payment type from user input
 * @returns {boolean} true if valid, false otherwise
 */
function isValidPaymentType(paymentType) {
  // Must be a string
  if (!paymentType || typeof paymentType !== 'string') {
    return false;
  }

  // Must be in allowlist
  if (!ALLOWED_PAYMENT_TYPES.has(paymentType)) {
    return false;
  }

  // Additional safety: reject any path separators or special characters
  // Valid payment types should only contain lowercase letters
  if (!/^[a-z]+$/.test(paymentType)) {
    return false;
  }

  return true;
}

/**
 *
 * @param {string} modulePath - Complete module path from user input
 * @returns {boolean} true if valid, false otherwise
 */
function isValidModulePath(modulePath) {
  // Must be a string
  if (!modulePath || typeof modulePath !== 'string') {
    return false;
  }

  // Must be in allowlist - this prevents loading arbitrary modules
  if (!ALLOWED_MODULES.has(modulePath)) {
    return false;
  }

  // Additional safety: ensure it starts with expected prefix
  if (!modulePath.startsWith('@isv-occ-payment/')) {
    return false;
  }

  return true;
}

/**
 * Handle payment route request
 * @param {Object} req - Transaction request
 * @param {Object} res - Transaction response
 */
async function paymentRouteHandler(req, res) {
  //Get gateway module name
  let gatewayModule = req.body.gatewaySettings && req.body.gatewaySettings.module;

  if (gatewayModule) {
    if (!isValidModulePath(gatewayModule)) {
      logger.debug(`Invalid module path rejected: ${typeof gatewayModule} ${String(gatewayModule).substring(0, 100)}`);
      throw new Error('Invalid module path. Module must be a valid payment service.');
    }
  } else {
    // Module not provided directly, construct it from payment type
    const gatewayModuleName = [
      req.body.customProperties && req.body.customProperties.paymentType,
      req.body.paymentMethod
    ].filter((el) => el)[0];
    if (!gatewayModuleName) {
      throw new Error('Missing gateway module name');
    }

    if (!isValidPaymentType(gatewayModuleName)) {
      logger.debug(`Invalid payment type rejected: ${typeof gatewayModuleName} ${String(gatewayModuleName).substring(0, 50)}`);
      throw new Error('Invalid payment type. Allowed types: applepay, card, generic, googlepay');
    }

    gatewayModule = `@isv-occ-payment/${gatewayModuleName}-payment-service`;
  }

  if (!isValidModulePath(gatewayModule)) {
    logger.error(`Module path validation failed after construction: ${gatewayModule}`);
    throw new Error('Invalid module path after validation');
  }
  
  logger.debug(
    `${req.method} ${req.path}; order=${req.body.orderId}; paymentGroup=${req.body.paymentId}`
  );

  //Get gateway identifier
  const gatewayId = req.body.gatewayId;
  logger.debug(`gateway.id=${gatewayId}; module=${gatewayModule}`);

  //Get service by identifier
  const paymentService = ServiceFactory.createFromRequest(
    gatewayId,
    gatewayModule,
    req.body.gatewaySettings
  );
  logger.debug(`service.id=${paymentService.id}`);

  req.merchantConfig = res.locals && res.locals.merchantConfig;
  //Execute service processor for transaction type
try {
    const serviceResponse = await paymentService.process(req, res);
    logger.debug(`Payment webhook response: ${JSON.stringify(res.locals.data)}`);
    return res.locals.data;
    
  } catch (error) {
    return errorHandler(error, req);
  }
}

module.exports.paymentRouter = paymentRouteHandler;
