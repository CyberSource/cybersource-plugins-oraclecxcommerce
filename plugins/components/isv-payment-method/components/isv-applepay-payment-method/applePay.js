/**
 *
 * @param {Object} configuration
 * * @param {React.Ref} container
 * @param {function('handleApplePay'|'onPaymentAuthorized'|'createApplePaySession', paymentData?)} callBackFunc - ('handleGooglePayButtonClick'|'onPaymentAuthorized', paymentData?)
 */

export default function ApplePay(configuration, container, callBackFunc) {
  const ERROR = 'ERROR';
  this.configuration = configuration;

  this.handleApplePay = async function (paymentData) {
    const configNetworks = this.configuration.applePaySupportedNetworks;
    let applePaySupportedNetworks = configNetworks.split(',');
    const paymentRequest = {
      countryCode: paymentData.countryCode,
      currencyCode: paymentData.currencyCode,
      total: {
        label: this.configuration.applePayDisplayName,
        amount: paymentData.totalPrice
      },
      supportedNetworks: applePaySupportedNetworks,
      merchantCapabilities: ['supports3DS', 'supportsEMV', 'supportsCredit', 'supportsDebit']
    };
    return new Promise((resolve, reject) => {
      let session = new ApplePaySession(3, paymentRequest);
      session.onvalidatemerchant = getOnValidateMerchant(resolve, reject, session);
      session.onpaymentauthorized = getOnPaymentAuthorized(resolve, reject, session);
      session.oncancel = getOnCancel(resolve, session);
      session.begin();
    }).catch(err => {
      console.log(err);
      callBackFunc(ERROR);
    });
  };

  const getOnValidateMerchant = (resolve, reject, session) => {
    return event => {
      performValidation(event.validationURL)
        .then(response => {
          session.completeMerchantValidation(response);
          resolve();
        })
        .catch(err => {
          callBackFunc(ERROR);
          reject('Validation error');
        });
    };
  };

  const performValidation = async function (validationUrl) {
    try {
      const merchSession = await createApplePaySession(validationUrl);
      return merchSession;
    } catch (err) {
      callBackFunc(ERROR);
    }
  };

  const getOnPaymentAuthorized = (resolve, reject, session) => {
    return event => {
      if (event.payment.token.paymentData) {
        performApplePayPayment(event.payment.token.paymentData, session);
        resolve();
      } else {
        reject('Payment error');
      }
    };
  };

  const createApplePaySession = async function (validationUrl) {
    let data = await callBackFunc('VALIDATION', validationUrl);
    return data;
  };

  const performApplePayPayment = function (paymentData, session) {
    let paymentDataString;
    if (paymentData != undefined) {
      paymentDataString = paymentData;
      session.completePayment(window.ApplePaySession.STATUS_SUCCESS);
      callBackFunc('PAYMENT_AUTHORIZE', paymentDataString);
    } else {
      callBackFunc(ERROR);
    }
  };

  const getOnCancel = (resolve, session) => {
    return event => {
      resolve('Cancelled');
      callBackFunc(ERROR);
    };
  };

  this.destroy = function () {
    document.getElementById(container).innerHTML = '';
  };
}
