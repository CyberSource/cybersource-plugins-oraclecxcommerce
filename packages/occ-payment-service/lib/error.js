'use strict';

/**
 * Error wrapper for bad request errors.
 *
 * @class BadRequestErrorClass
 * @extends {Error}
 */
class BadRequestErrorClass extends Error {
  /**
   * @constructor
   * @param {string} message The error message.
   */
  constructor(message) {
    super(message);
    this.status = 400;
    Error.captureStackTrace(this, BadRequestErrorClass);
  }
}

/**
 * Error wrapper for not found errors.
 *
 * @class NotFoundErrorClass
 * @extends {Error}
 */
class NotFoundErrorClass extends Error {
  /**
   * @constructor
   * @param {string} message The error message.
   */
  constructor(message) {
    super(message);
    this.status = 404;
    Error.captureStackTrace(this, NotFoundErrorClass);
  }
}

/**
 * Error wrapper for unauthorized errors.
 *
 * @class UnauthorizedRequestErrorClass
 * @extends {Error}
 */
class UnauthorizedRequestErrorClass extends Error {
  /**
   * @constructor
   * @param {string} message The error message.
   */
  constructor(message) {
    super(message);
    this.status = 401;
    Error.captureStackTrace(this, UnauthorizedRequestErrorClass);
  }
}

/**
 * Error wrapper for bad gateway errors.
 *
 * @class BadGatewayErrorClass
 * @extends {Error}
 */
class BadGatewayErrorClass extends Error {
  /**
   * @constructor
   * @param {string} message The error message.
   */
  constructor(message) {
    super(message);
    this.status = 502;
    Error.captureStackTrace(this, BadGatewayErrorClass);
  }
}

module.exports.BadRequestError = BadRequestErrorClass;
module.exports.UnauthorizedRequestError = UnauthorizedRequestErrorClass;
module.exports.BadGatewayError = BadGatewayErrorClass;
module.exports.NotFoundError = NotFoundErrorClass;
// export default BadGatewayErrorClass;
// export default UnauthorizedRequestErrorClass;
// export default BadGatewayErrorClass;
// export default NotFoundErrorClass;
