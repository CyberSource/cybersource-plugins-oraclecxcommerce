export const isReadyToPay = jest.fn();

export const loadPaymentData = jest.fn();

export default class PaymentsClient {
  paymentOptions: google.payments.api.PaymentOptions;

  constructor(paymentOptions: google.payments.api.PaymentOptions) {
    this.paymentOptions = paymentOptions;
  }

  isReadyToPay = isReadyToPay;

  loadPaymentData = loadPaymentData;

  createButton(options: google.payments.api.ButtonOptions) {
    const button = document.createElement('button');

    button.onclick = options.onClick;
    button.setAttribute('data-testid', 'googlePayButton');

    return button;
  }
}
