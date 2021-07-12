import cryptoService from '@server-extension/services/cryptoService';
import cacheService from '../../../services/cacheService';
import { sendPaymentRequest, verifyCardResponse } from '../common';
import gatewaySettings from '../data/gatewaySettings';
import {
  cardAuthDeviceFingerprintRequest,
  cardAuthPaymentTokenRequest,
  cardAuthRequest,
  cardAuthSaveCardRequest,
  cardAuthTransientTokenRequest
} from './common';

describe.skipNotSupported('Generic Webhook Request - Card Payments', 'card', () => {
  beforeEach(() => {
    cacheService.flushAll();
    gatewaySettings.deviceFingerprintEnabled = false;
  });

  it('Should handle credit card authorization', async () => {
    gatewaySettings.payerAuthEnabled = false;

    const response = await sendPaymentRequest(cardAuthRequest).expect(200);

    verifyCardResponse(cardAuthRequest, response.body);
    expect(response.body.authorizationResponse).toMatchObject({
      authCode: 'AUTHORIZED',
      responseCode: '1000',
      responseReason: 'AUTHORIZED',
      responseDescription: 'AUTHORIZED'
    });
  });

  it('Should handle credit card sale', async () => {
    gatewaySettings.saleEnabled = 'card';

    const response = await sendPaymentRequest(cardAuthRequest).expect(200);

    verifyCardResponse(cardAuthRequest, response.body);
    expect(response.body.authorizationResponse).toMatchObject({
      authCode: 'SALE_COMPLETE',
      responseCode: '4000',
      responseReason: 'SALE_COMPLETE',
      responseDescription: 'SALE_COMPLETE',
      additionalProperties: { sale: 'true' }
    });
  });

  it('Should handle credit card authorization using tms token', async () => {
    gatewaySettings.saleEnabled = '';

    const authorization = await sendPaymentRequest(cardAuthSaveCardRequest).expect(200);

    cardAuthPaymentTokenRequest.cardDetails.token = authorization.body.authorizationResponse.token;

    const response = await sendPaymentRequest(cardAuthPaymentTokenRequest).expect(200);

    verifyCardResponse(cardAuthPaymentTokenRequest, response.body);
    expect(response.body.authorizationResponse).toMatchObject({
      authCode: 'AUTHORIZED',
      responseCode: '1000',
      responseReason: 'AUTHORIZED',
      responseDescription: 'AUTHORIZED'
    });
  });

  it.skip('Should authorize payment using transient token', async () => {
    cardAuthTransientTokenRequest.customProperties = {
      transientTokenJwt: 'VALID_TRANSIENT_TOKEN'
    };
    const response = await sendPaymentRequest(cardAuthTransientTokenRequest).expect(200);

    verifyCardResponse(cardAuthTransientTokenRequest, response.body);
    expect(response.body.authorizationResponse).toMatchObject({
      authCode: 'AUTHORIZED',
      responseCode: '1000',
      responseReason: 'AUTHORIZED',
      responseDescription: 'AUTHORIZED'
    });
  });

  it('Should handle credit card authorization with device fingerprint', async () => {
    gatewaySettings.payerAuthEnabled = false;
    gatewaySettings.deviceFingerprintEnabled = true;

    const response = await sendPaymentRequest(cardAuthDeviceFingerprintRequest).expect(200);

    verifyCardResponse(cardAuthDeviceFingerprintRequest, response.body);
    expect(response.body.authorizationResponse).toMatchObject({
      authCode: 'AUTHORIZED',
      responseCode: '1000',
      responseReason: 'AUTHORIZED',
      responseDescription: 'AUTHORIZED'
    });
  });

  it('Should fail card authorization with tampered device fingerprint', async () => {
    gatewaySettings.payerAuthEnabled = false;
    gatewaySettings.deviceFingerprintEnabled = true;
    const cipher = cryptoService.encrypt('sessionId');
    cardAuthDeviceFingerprintRequest.customProperties = {
      deviceFingerprintSessionId: 'TAMPERED',
      deviceFingerprintCipherEncrypted: cipher.encrypted,
      deviceFingerprintCipherIv: cipher.iv
    };

    const response = await sendPaymentRequest(cardAuthDeviceFingerprintRequest).expect(200);

    verifyCardResponse(cardAuthDeviceFingerprintRequest, response.body);
    expect(response.body.authorizationResponse).toMatchObject({
      authCode: 'DECLINED',
      responseCode: '9000',
      responseReason: 'DECLINED',
      responseDescription: 'Device fingerprint could not be verified'
    });
  });

  it('Should handle credit card authorization when decision manager returns AUTHORIZED_PENDING_REVIEW', async () => {
    cardAuthRequest.billingAddress.firstName = 'Review';
    gatewaySettings.saleEnabled = 'card';

    const response = await sendPaymentRequest(cardAuthRequest).expect(200);

    verifyCardResponse(cardAuthRequest, response.body);
    expect(response.body.authorizationResponse).toMatchObject({
      authCode: 'AUTHORIZED_PENDING_REVIEW',
      responseCode: '1000',
      responseReason: 'AUTHORIZED_PENDING_REVIEW',
      responseDescription: 'AUTHORIZED_PENDING_REVIEW'
    });
  });

  it('Should skip decision manager', async () => {
    gatewaySettings.dmDecisionSkip = 'card,googlepay,applepay';
    gatewaySettings.saleEnabled = '';
    cardAuthRequest.billingAddress.firstName = 'Review';

    const response = await sendPaymentRequest(cardAuthRequest).expect(200);

    verifyCardResponse(cardAuthRequest, response.body);
    expect(response.body.authorizationResponse).toMatchObject({
      authCode: 'AUTHORIZED',
      responseCode: '1000',
      responseReason: 'AUTHORIZED',
      responseDescription: 'AUTHORIZED'
    });
  });

  it('Should fail without card number', async () => {
    cardAuthRequest.cardDetails.number = undefined;

    const response = await sendPaymentRequest(cardAuthRequest).expect(200);

    verifyCardResponse(cardAuthRequest, response.body);
    expect(response.body.authorizationResponse).toMatchObject({
      authCode: 'DECLINED',
      responseCode: '9000',
      responseReason: 'DECLINED',
      responseDescription: 'An error occurred during execution of exports:createPayment'
    });
  });
});
