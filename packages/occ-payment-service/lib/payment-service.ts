/**
 * @namespace occ-dev-com
 */

/** Oracle Commerce payment service implementation
 * @requires module:constants
 * @requires module:error
 */
'use strict';

import { Constants } from './constants';
import { BadRequestError } from './error';
import { Request } from 'express';

/**
 * Payment service implementation
 * @class
 */
export class PaymentService {
  /**
   * @constructor
   * @param {Object} opts - service options
   * @param {string} opts.id - service identifier
   * @param {string} opts.module - service module name
   * @param {string} opts.settings - gateway service settings
   * @param {Array} opts.processors - array of transaction processors
   */
  constructor(opts: any = {}) {
    this._id = opts.id;
    this._module = opts.module;
    this._settings = opts.settings || {};
    this._processors = opts.processors;
  }
  _id: string;
  _module: string;
  _settings: any;
  _processors: any[];

  /**
   * Get service identifier
   * @returns {string}
   */
  get id() {
    return this._id;
  }

  /**
   * Get service module name
   * @returns {string}
   */
  get module() {
    return this._module;
  }

  /**
   * Payment gateway settings
   * @returns {Object}
   */
  get settings() {
    return this._settings;
  }

  /**
   * Get service processors
   * @returns {Array}
   */
  get processors() {
    return this._processors;
  }

  /**
   * Return transaction code based on webhook payload provided transaction type
   * @param {string} transactionType transaction type
   * @returns {string}
   */
  getTransactionCode(transactionType: string) {
    switch (transactionType) {
      case Constants.PAYMENT_TRANSACTION_TYPE_AUTHORIZE:
        return Constants.PAYMENT_TRANSACTION_NAME_AUTHORIZE;
      case Constants.PAYMENT_TRANSACTION_TYPE_VOID:
        return Constants.PAYMENT_TRANSACTION_NAME_VOID;
      case Constants.PAYMENT_TRANSACTION_TYPE_CAPTURE:
        return Constants.PAYMENT_TRANSACTION_NAME_CAPTURE;
      case Constants.PAYMENT_TRANSACTION_TYPE_REFUND:
        return Constants.PAYMENT_TRANSACTION_NAME_REFUND;
      case Constants.PAYMENT_TRANSACTION_BALANCE_INQUIRY:
        return Constants.PAYMENT_TRANSACTION_NAME_BALANCE_INQUIRY;
      case Constants.PAYMENT_TRANSACTION_CASH_REQUEST:
        return Constants.PAYMENT_TRANSACTION_NAME_CASH_REQUEST;
      case Constants.PAYMENT_TRANSACTION_CASH_CANCEL:
        return Constants.PAYMENT_TRANSACTION_NAME_CASH_CANCEL;
      case Constants.PAYMENT_TRANSACTION_INVOICE_AUTHORIZE:
        return Constants.PAYMENT_TRANSACTION_NAME_INVOICE_AUTHORIZE;
      default:
        return transactionType;
    }
  }

  /**
   * Return appropriate processor based on transaction type
   * @param {string} transationType transaction type
   * @return  {Object} processor - instance of transaction processor
   * @throws error if transaction type is invalid
   */
  getProcessor(transactionType: string) {
    const transactionName = this.getTransactionCode(transactionType);
    const processor = this._processors.find((processor) => processor.name === transactionName);
    if (processor) {
      return processor;
    } else {
      throw new BadRequestError('Invalid transaction type');
    }
  }

  /**
   * Handle complete flow of service transaction request
   * @param  {Object} req - Incoming request
   * @returns {Object} response - Current transaction processor response
   */
  async process(req: Request) {
    try {
      const processor = this.getProcessor(req.body.transactionType);
      return await processor.processAll(req);
    } catch (error) {
      // logger.error(error);
      throw error;
    }
  }
}
