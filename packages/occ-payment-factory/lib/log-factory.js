/**
 * @namespace isv-occ-payment
 */
'use strict';

/**
 * Winston logger
 * @const
 *
 */
const winston = require('winston');

/**
 * Factory class to create logger<br>
 * Set logger to global.occ.logger to duplicate how setup on Commerce server
 * @class
 */
class LogFactoryClass {
  // export class LogFactory {
  static logger() {
    if (!global.occ) {
      //Create new logger
      const logger = winston.createLogger({
        levels: {
          error: 0,
          warning: 1,
          info: 2,
          debug: 3
        },
        transports: [
          new winston.transports.Console(
            { level: 'debug', colorize: true },
            { level: 'error', stack: true }
          )
        ]
      });
      //Add logger to globals.occ
      global.occ = { logger };
    }
    //Return logger
    return global.occ.logger;
  }
}

module.exports.LogFactory = LogFactoryClass;
