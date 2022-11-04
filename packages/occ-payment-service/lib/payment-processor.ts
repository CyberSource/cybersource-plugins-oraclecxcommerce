/**
 * @namespace occ-dev-com
 */
'use strict';

/**
 * @const
 */
import { Constants } from './constants';
import { Request } from 'express';

/**
 * Transaction processor class
 * @class
 */
export class PaymentProcessor {
  /**
   * @constructor
   * @param {Object} opts - service options
   * @param {string} opts.name - processor name
   * @param {Array} opts.middlewares - array of processor middleware functions
   */
  constructor(opts: any = {}) {
    this._name = opts.name;
    this._middlewares = opts.middlewares || [];
  }
  // constructor(opts?: { name: string; middlewares: Array<any> });
  _name: string;
  _middlewares: any[];

  /**
   * Name
   * @returns {string}
   */
  get name() {
    return this._name;
  }

  /**
   * Transaction type
   * @returns {string}
   */
  get transactionType() {
    switch (this._name) {
      case Constants.PAYMENT_TRANSACTION_NAME_AUTHORIZE:
        return Constants.PAYMENT_TRANSACTION_TYPE_AUTHORIZE;
      case Constants.PAYMENT_TRANSACTION_NAME_VOID:
        return Constants.PAYMENT_TRANSACTION_TYPE_VOID;
      case Constants.PAYMENT_TRANSACTION_NAME_CAPTURE:
        return Constants.PAYMENT_TRANSACTION_TYPE_CAPTURE;
      case Constants.PAYMENT_TRANSACTION_NAME_REFUND:
        return Constants.PAYMENT_TRANSACTION_TYPE_REFUND;
      case Constants.PAYMENT_TRANSACTION_NAME_BALANCE_INQUIRY:
        return Constants.PAYMENT_TRANSACTION_BALANCE_INQUIRY;
      case Constants.PAYMENT_TRANSACTION_NAME_CASH_REQUEST:
        return Constants.PAYMENT_TRANSACTION_CASH_REQUEST;
      case Constants.PAYMENT_TRANSACTION_NAME_CASH_CANCEL:
        return Constants.PAYMENT_TRANSACTION_CASH_CANCEL;
      case Constants.PAYMENT_TRANSACTION_NAME_INVOICE_AUTHORIZE:
        return Constants.PAYMENT_TRANSACTION_INVOICE_AUTHORIZE;
      default:
        return this._name;
    }
  }

  /**
   * Middlewares
   * @returns {Array}
   */
  get middlewares() {
    return this._middlewares;
  }

  /**
   * Execute all configured processor middlewares.
   * Iterate through each middleware function and run a single async operation at a time
   * in series and ensure that functions will complete in order.
   * @function
   * @async
   * @param {Object} req Request payload
   * @param {Object} res Response payload
   * @see {@link https://expressjs.com/en/guide/using-middleware.html}
   */
  async executeMiddlewares(req: Request, res: any) {
    for (const middleware of this._middlewares) {
      await middleware(req, res);
    }
  }

  /**
   * Execute all middlewares in configured order, passing in request and returns response
   * @param {Object} request - Request object
   * @returns {Object} response - Processor transaction response
   */
  async processAll(req: Request) {
    //Initialize empty response
    const res = {};

    //Execute all middlewares in configured order, passing in request and (initially) empty response
    await this.executeMiddlewares(req, res);

    //Send response
    return res;
  }
}
