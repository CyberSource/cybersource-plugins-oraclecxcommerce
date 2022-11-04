/**  @type {google.payments.api} */

/**
 *
 * @param {Object} configuration
 * @param {'TEST'|'PRODUCTION'} configuration.googlePayEnvironment
 * @param {String} configuration.googlePayGateway
 * @param {String} configuration.googlePayGatewayMerchantId
 * @param {String} configuration.googlePayMerchantId
 * @param {String} configuration.googlePayMerchantName
 * @param {'AMEX,DISCOVER,INTERAC,JCB,MASTERCARD,VISA'} configuration.googlePaySupportedNetworks - All supported card name seprated by comma
 * @param {React.Ref} container
 */

export default function GooglePay(configuration, container) {
  this.configuration = configuration;
  this.paymentsClient = null;
  let _this = this;
  this.allowedAuthMethods = ['PAN_ONLY', 'CRYPTOGRAM_3DS'];
  this.tokenizationSpecification = {
    type: 'PAYMENT_GATEWAY',
    parameters: {
      gateway: this.configuration.googlePayGateway,
      gatewayMerchantId: this.configuration.googlePayMerchantId
    }
  };
  this.cardPaymentMethod = {
    type: 'CARD',
    tokenizationSpecification: this.tokenizationSpecification,
    parameters: {
      allowedAuthMethods: this.allowedAuthMethods,
      allowedCardNetworks: this.configuration.googlePaySupportedNetworks.split(',').map(cardType => cardType.trim())
    }
  };
  this.googlePayConfiguration = {
    apiVersion: 2,
    apiVersionMinor: 0,
    allowedPaymentMethods: [this.cardPaymentMethod]
  };

  /**
   *
   * @returns {google.payments.api.PaymentsClient} googlepay paymentsClient
   */
  this.getPaymentsClient = function () {
    if (!this.paymentsClient) {
      this.paymentsClient = new google.payments.api.PaymentsClient({
        environment: this.configuration.googlePayEnvironment,
        merchantInfo: {
          merchantName: this.configuration.googlePayMerchantName,
          merchantId: this.configuration.googlePayGatewayMerchantId
        }
      });
    }
    return this.paymentsClient;
  };

  /**
   * Setup google pay
   * @param {function('handleGooglePayButtonClick'|'onPaymentAuthorized', paymentData?)} funcCallback - ('handleGooglePayButtonClick'|'onPaymentAuthorized', paymentData?)
   */
  this.loadGooglePay = function (funcCallback) {
    //create client
    let paymentsClient = this.getPaymentsClient();
    paymentsClient
      .isReadyToPay(this.googlePayConfiguration)
      .then(
        function (response) {
          if (response.result) {
            _this.funcCallback = funcCallback;
            this.createButton(container);
          }
        }.bind(this)
      )
      .catch(err => {
        console.log(err);
      });
  };

  this.createButton = function () {
    let paymentsClient = this.getPaymentsClient();
    document.getElementById(container).appendChild(
      paymentsClient.createButton({
        onClick: this.handleGooglePayButtonClick
      })
    );
  };

  this.handleGooglePayButtonClick = function () {
    _this.funcCallback('GOOGLEPAY_BUTTON_CLICK');
  };

  /**
   *
   * @param {Object} transactionInfo
   * @param {String} transactionInfo.countryCode
   * @param {String} transactionInfo.currencyCode
   * @param {String} transactionInfo.totalPriceStatus
   * @param {String} transactionInfo.totalPrice
   * @param {String} transactionInfo.totalPriceLabel
   */
  this.loadPaymentDataRequest = function (transactionInfo) {
    const paymentDataRequest = {...this.googlePayConfiguration};
    paymentDataRequest.merchantInfo = {
      merchantName: this.configuration.googlePayMerchantName,
      merchantId: this.configuration.googlePayGatewayMerchantId
    };
    paymentDataRequest.transactionInfo = transactionInfo;
    const paymentsClient = this.getPaymentsClient();
    paymentsClient
      .loadPaymentData(paymentDataRequest)
      .then(paymentData => {
        this.funcCallback('PAYMENT_AUTHORIZE', paymentData);
      })
      .catch(err => {
        if (err?.statusCode === 'CANCELED') {
          return this.funcCallback('PAYMENT_AUTHORIZE', {
            transactionState: 'CANCELED',
            error: {
              intent: 'PAYMENT_AUTHORIZATION',
              message: 'Payment canceled',
              reason: 'PAYMENT_CANCELED'
            }
          });
        }
        if (err?.statusCode === 'DEVELOPER_ERROR')
          return this.funcCallback('PAYMENT_AUTHORIZE', {
            transactionState: 'ERROR',
            error: {
              intent: 'PAYMENT_AUTHORIZATION',
              message: 'Unexpected error',
              reason: 'Internal error'
            }
          });
        this.funcCallback('PAYMENT_AUTHORIZE', {
          transactionState: 'ERROR',
          error: {
            intent: 'PAYMENT_AUTHORIZATION',
            message: 'Insufficient funds',
            reason: 'PAYMENT_DATA_INVALID'
          }
        });
      });
  };

  this.destroy = function () {
    this.paymentsClient = null;
    document.getElementById(container).innerHTML = '';
  };
}
