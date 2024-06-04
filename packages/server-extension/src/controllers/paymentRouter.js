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
 * Handle payment route request
 * @param {Object} req - Transaction request
 * @param {Object} res - Transaction response
 */
async function paymentRouteHandler(req, res) {
  //Get gateway module name
  let gatewayModule = req.body.gatewaySettings && req.body.gatewaySettings.module;
  if (!gatewayModule) {
    const gatewayModuleName = [
      req.body.customProperties && req.body.customProperties.paymentType,
      req.body.paymentMethod
    ].filter((el) => el)[0];
    if (!gatewayModuleName) {
      throw new Error('Missing gateway module name');
    }
    gatewayModule = `@isv-occ-payment/${gatewayModuleName}-payment-service`;
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

  //Execute service processor for transaction type
  //return await paymentService.process(req);
  try {
    const serviceResponse = await paymentService.process(req);
    logger.debug(`Payment webhook response: ${JSON.stringify(serviceResponse)}`);
    return serviceResponse;
  } catch (error) {
    return errorHandler(error, req);
  }
}

module.exports.paymentRouter = paymentRouteHandler;
