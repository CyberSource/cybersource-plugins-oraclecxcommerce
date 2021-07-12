export type PAYMENT_METHOD_TYPE = 'card' | 'googlepay' | 'applepay';

export interface OnlinePaymentDetails {
  type: 'generic';
  customProperties: {
    paymentType: 'applepay' | 'googlepay';
    paymentToken: string;
  };
}

export interface PayerAuthProperties {
  referenceId?: string;
  authJwt?: string;
}

export interface CaptureContextProperties {
  captureContext: string;
  captureContextCipherEncrypted: string;
  captureContextCipherIv: string;
}

export interface CardFormPaymentDetails {
  type: 'card';
  cardType: string;
  nameOnCard: string;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  saveCard?: boolean;
  setAsDefault?: boolean;
  customProperties: CaptureContextProperties &
    PayerAuthProperties & {
      transientTokenJwt: string;
    };
}

export interface SavedCardPaymentDetails {
  type: 'card';
  savedCardId: string;
  customProperties: PayerAuthProperties;
}

export type CardPaymentDetails = CardFormPaymentDetails | SavedCardPaymentDetails;

export interface RejectedPaymentDetails {
  type: string;
  data?: any;
}

export type PaymentDetails = OnlinePaymentDetails | CardPaymentDetails;
