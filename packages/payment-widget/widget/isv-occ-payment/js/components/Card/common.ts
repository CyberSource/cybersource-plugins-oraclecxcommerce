import { CaptureContextProperties, CardFormPaymentDetails } from '@payment-widget/store/common';

export type SavedCardModelDetails = {
  savedCardId: string;
  customProperties?: undefined;
};

export type CreditCardFormModelDetails = Omit<
  CardFormPaymentDetails,
  'type' | 'customProperties'
> & {
  customProperties: CaptureContextProperties & {
    transientTokenJwt: string;
  };
};

export type CardModelDetails = SavedCardModelDetails | CreditCardFormModelDetails;

export interface CardModel {
  validate(): boolean;
  getBin(): string;
  getCardData(): Promise<CardModelDetails> | CardModelDetails;
  reset(): void;
}

export interface CardPaymentController {
  selectModel(cardModel: CardModel): void;
}

export interface ValidationOptions {
  acsUrl: string;
  pareq: string;
  authenticationTransactionId: string;
}

export interface PaymentAuthConfig {
  payerAuthEnabled: boolean;

  songbirdUrl: string;
}

export interface PaymentAuthActions {
  updateBin(cardNumber: string): void;
  getReferenceId(): Promise<{ referenceId?: string }>;
  getAuthJwt(options: ValidationOptions): Promise<{ authJwt?: string }>;
}
