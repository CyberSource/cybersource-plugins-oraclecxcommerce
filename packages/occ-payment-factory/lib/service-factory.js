/**
 * @namespace isv-occ-payment
 */

/**
 * Factory class to create gateway services
 * @class
 *
 */
class ServiceFactoryClass {
  /**
   * Create instance of default class of module reference from request payload
   * @static
   * @param {string} id - Identifier of payment gateway service
   * @param  {string} module - Module name
   * @param  {Object} opts - Class constructor options
   * @returns {Object} New instance of class exported by module name
   * @example
   * const service = ServiceFactory.createFromRequest('card'', '@isv-occ-payment/card-payment-service', opts);
   */
  static createFromRequest(id, module, opts) {
    const classType = require(module);
    //Create new instance of classType
    return new classType({ id: id, module: module, ...opts });
  }

  /**
   * Register id and module name of all gateway services
   * @static
   * @param {string} id - Identifier of payment gateway service
   * @param {string} module - Gateway service module name
   */
  static register(id, module) {
    if (!this._registeredTypes.has(id)) {
      //console.debug(`setting: id=${id};moduleName=${moduleName}`);
      this._registeredTypes.set(id, module);
    }
  }

  /**
   * Create instance of default class of configured module reference by identifier
   * @static
   * @param {string} id - Identifier of payment gateway service
   * @param  {Object} opts - Class constructor options
   * @returns {Object} New instance of class exported by module name
   */
  static create(id, opts) {
    //console.debug(`${name} looking.`);
    if (!this._registeredTypes.has(id)) {
      console.error(`${id} not found.`);
      return null;
    }

    const module = this._registeredTypes.get(id);
    //console.debug(`found ${className}`);
    const classType = require(module);
    //console.debug(`type ${classType}`);

    //Create new instance of classType defined in config
    return new classType({ id: id, module: module, ...opts });
  }
}

ServiceFactoryClass._registeredTypes = new Map();

module.exports.ServiceFactory = ServiceFactoryClass;
