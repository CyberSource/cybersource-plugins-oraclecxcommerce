import app from '@server-extension/__tests__/int/test.app';
import request from 'supertest';
import { RequestBuilder } from '../data/webhook/common';

export const cardAuthRequest = new RequestBuilder()
  .transactionType('0100')
  .paymentMethod('card')
  .build({});

export const cardAuthSaveCardRequest = new RequestBuilder()
  .transactionType('0100')
  .paymentMethod('card')
  .build({ cardDetails: { saveCard: true } });

export const cardAuthPaymentTokenRequest = new RequestBuilder()
  .transactionType('0100')
  .paymentMethod('card')
  .build({
    cardDetails: {
      number: undefined,
      cvv: undefined,
      maskedCardNumber: '4111********1111',
      token: ''
    }
  });

export const cardAuthTransientTokenRequest = new RequestBuilder()
  .transactionType('0100')
  .paymentMethod('card')
  .build({ customProperties: { transientTokenJwt: '' } });

export const cardAuthDeviceFingerprintRequest = new RequestBuilder()
  .transactionType('0100')
  .paymentMethod('card')
  .build({
    customProperties: {
      deviceFingerprintSessionId: 'sessionId',
      deviceFingerprintCipherEncrypted: 'ht+Gv58UHZ2wZH9wrq4sCA==',
      deviceFingerprintCipherIv: 'q6nmO4oXPzZaaMoypTPV8g=='
    }
  });

export const cardAuthPAEnrollRequest = new RequestBuilder()
  .transactionType('0100')
  .paymentMethod('card')
  .cardNumber('4000000000001091')
  .build({ customProperties: { referenceId: 'referenceId' } });

export const cardAuthPAValidateRequest = new RequestBuilder()
  .transactionType('0100')
  .paymentMethod('card')
  .cardNumber('4000000000001091')
  .build({ customProperties: { authJwt: '' } });

export const sendGenerateJWTRequest = (orderData: OCC.OrderData) => {
  return request(app)
    .post('/ccstorex/custom/isv-payment/v1/payerAuth/generateJwt')
    .send(orderData)
    .set('Accept', 'application/json')
    .set('channel', 'storefront');
};

export const paymentGroup = (
  hostTransactionId: string,
  pgId: string,
  state: 'AUTHORIZED' | 'SETTLED'
): OCC.PaymentGroup => ({
  id: pgId,
  state,
  [state === 'SETTLED' ? 'debitStatus' : 'authorizationStatus']: [
    {
      transactionSuccess: true,
      statusProps: {
        hostTransactionId: hostTransactionId
      }
    }
  ]
});
