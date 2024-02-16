let Microform = /** @class */ (function () {
  function Microform(options) {
    this.options = options;
  }
  Microform.prototype.setup = function (captureContext) {
    let myStyles = {
      input: {
        'font-size': '1rem',
        'line-height': '1.5',
        'font-family': 'helvetica, tahoma, calibri, sans-serif'
      },
      ':focus': {
        color: '#000000'
      },
      ':disabled': {
        cursor: 'not-allowed'
      },
      valid: {
        color: '#3c763d'
      },
      invalid: {
        color: '#a94442'
      }
    };
    this.microform = new Flex(captureContext).microform({styles: myStyles});
    let securityCode = this.microform.createField('securityCode');
    let number = this.microform.createField('number');
    number.load(this.options.cardNumberContainer);
    this.number = number;
    securityCode.load(this.options.securityCodeContainer);
    this.securityCode = securityCode;
  };

  Microform.prototype.createToken = function (cardOptions) {
    let _this = this;
    return new Promise(function (resolve, reject) {
      _this.microform.createToken(cardOptions, function (err, response) {
        return err ? reject(err.message) : resolve(response);
      });
    });
  };
  return Microform;
})();

export default Microform;
