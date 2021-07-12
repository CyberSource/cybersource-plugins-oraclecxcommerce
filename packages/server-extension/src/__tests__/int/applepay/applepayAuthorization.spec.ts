import cacheService from '@server-extension/services/cacheService';
import cryptoService from '@server-extension/services/cryptoService';
import { sendPaymentRequest, verifyResponse } from '../common';
import gatewaySettings from '../data/gatewaySettings';
import { applePayAuthDeviceFingerprintRequest, applePayAuthRequest, PAYMENT_TOKEN } from './common';

describe.skipNotSupported('Generic Webhook Request - Apple Pay Payments', 'applepay', () => {
  beforeEach(() => {
    cacheService.flushAll();
  });

  it('Should handle apple pay authorization', async () => {
    const response = await sendPaymentRequest(applePayAuthRequest).expect(200);

    verifyResponse(applePayAuthRequest, response.body);
    expect(response.body.response).toMatchObject({
      code: '1000',
      reason: 'AUTHORIZED',
      success: true
    });
  });

  it('Should skip decision manager', async () => {
    gatewaySettings.dmDecisionSkip = 'card,googlepay,applepay';
    applePayAuthRequest.billingAddress.firstName = 'Review';

    const response = await sendPaymentRequest(applePayAuthRequest).expect(200);

    verifyResponse(applePayAuthRequest, response.body);
    expect(response.body.response).toMatchObject({
      code: '1000',
      reason: 'AUTHORIZED',
      success: true
    });
  });

  it('Should handle apple pay authorization with sale', async () => {
    gatewaySettings.saleEnabled = 'applepay';
    const response = await sendPaymentRequest(applePayAuthRequest).expect(200);

    verifyResponse(applePayAuthRequest, response.body);
    expect(response.body.response).toMatchObject({
      code: '4000',
      reason: 'SALE_COMPLETE',
      success: true
    });
  });

  it('Should handle credit card authorization with device fingerprint', async () => {
    gatewaySettings.deviceFingerprintEnabled = true;
    gatewaySettings.saleEnabled = '';

    const response = await sendPaymentRequest(applePayAuthDeviceFingerprintRequest).expect(200);

    verifyResponse(applePayAuthDeviceFingerprintRequest, response.body);
    expect(response.body.response).toMatchObject({
      code: '1000',
      reason: 'AUTHORIZED',
      success: true
    });
  });

  it('Should fail card authorization with tampered device fingerprint', async () => {
    gatewaySettings.payerAuthEnabled = false;
    gatewaySettings.deviceFingerprintEnabled = true;
    const cipher = cryptoService.encrypt('sessionId');
    applePayAuthDeviceFingerprintRequest.customProperties = {
      paymentType: 'applepay',
      paymentToken: PAYMENT_TOKEN,
      deviceFingerprintSessionId: 'TAMPERED',
      deviceFingerprintCipherEncrypted: cipher.encrypted,
      deviceFingerprintCipherIv: cipher.iv
    };

    const response = await sendPaymentRequest(applePayAuthDeviceFingerprintRequest).expect(200);

    verifyResponse(applePayAuthDeviceFingerprintRequest, response.body);
    expect(response.body.response).toMatchObject({
      code: '9000',
      reason: 'DECLINED',
      responseDescription: 'Device fingerprint could not be verified',
      success: false
    });
  });
});
