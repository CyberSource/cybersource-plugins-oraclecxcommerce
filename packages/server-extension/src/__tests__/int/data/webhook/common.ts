import merge from 'deepmerge';
import webhookRequest from './webhookRequest.json';

const CURRENCY_CODE = 'USD';
export const DEFAULT_AMOUNT = '000000122526';

export class RequestBuilder {
  request: OCC.GenericPaymentWebhookRequest;

  constructor() {
    this.request = {
      ...webhookRequest
    };
  }

  transactionType(type: string) {
    this.request.transactionType = type;
    return this;
  }

  paymentMethod(method: string) {
    this.request.paymentMethod = method;

    return this;
  }

  cardNumber(number: string | undefined) {
    this.request.cardDetails.number = number;
    return this;
  }

  currency(code: string) {
    this.request.currencyCode = code;
    return this;
  }

  amount(value: string) {
    this.request.amount = value;
    return this;
  }

  build(input: Record<string, unknown>): OCC.GenericPaymentWebhookRequest {
    this.currency(CURRENCY_CODE);
    this.amount(DEFAULT_AMOUNT);

    return merge(this.request, input);
  }
}

export const authReversalRequest = (hostTransactionId = '', paymentMethod = 'card') =>
  new RequestBuilder()
    .transactionType('0110')
    .paymentMethod(paymentMethod)
    .build({ referenceInfo: { hostTransactionId } });

export const captureRequest = (hostTransactionId = '', paymentMethod = 'card') =>
  new RequestBuilder()
    .transactionType('0200')
    .paymentMethod(paymentMethod)
    .build({ referenceInfo: { hostTransactionId } });

export const refundRequest = (hostTransactionId = '', paymentMethod = 'card') =>
  new RequestBuilder()
    .transactionType('0400')
    .paymentMethod(paymentMethod)
    .build({ referenceInfo: { hostTransactionId } });

export const captureEndpointRequest = (transactionId: string) => {
  return {
    currency: CURRENCY_CODE,
    transactionId,
    amount: DEFAULT_AMOUNT,
    merchantReferenceNumber: 'o30446'
  };
};

export const refundEndpointRequest = (transactionId: string) => {
  return {
    currency: CURRENCY_CODE,
    transactionId: transactionId,
    amount: DEFAULT_AMOUNT,
    merchantReferenceNumber: 'o30446'
  };
};
