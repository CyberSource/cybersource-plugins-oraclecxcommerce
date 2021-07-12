export default class ApplePaySession {
  version: number;
  paymentRequest: ApplePayJS.ApplePayPaymentRequest;

  constructor(version: number, paymentRequest: ApplePayJS.ApplePayPaymentRequest) {
    this.version = version;
    this.paymentRequest = paymentRequest;
  }

  static canMakePayments = jest.fn();

  begin = jest.fn();
  completePayment = jest.fn();
  completeMerchantValidation = jest.fn();
}
