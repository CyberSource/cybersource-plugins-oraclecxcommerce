import { PaymentContext } from '@server-extension/common';
import cryptoService from '@server-extension/services/cryptoService';
import deviceFingerprintSessionIdValidator from '@server-extension/services/payments/validators/deviceFingerprintSessionIdValidator';
import { mockDeep } from 'jest-mock-extended';

const sessionId = 'sessionId';
const cipher = cryptoService.encrypt(sessionId);

const customProperties = {
  deviceFingerprintSessionId: sessionId,
  deviceFingerprintCipherEncrypted: cipher.encrypted,
  deviceFingerprintCipherIv: cipher.iv
};

describe('Device Fingerprint session id validator', () => {
  const context = mockDeep<PaymentContext>();
  const next = jest.fn();
  context.requestContext.gatewaySettings.deviceFingerprintEnabled = true;

  it('Should pass validation if sessionId is valid', async () => {
    context.webhookRequest.customProperties = customProperties;

    await deviceFingerprintSessionIdValidator(context, next);

    expect(next).toBeCalledTimes(1);
  });

  it('Should throw exception when session is tampered', async () => {
    customProperties.deviceFingerprintSessionId = 'TAMPERED';
    context.webhookRequest.customProperties = customProperties;

    await expect(deviceFingerprintSessionIdValidator(context, next)).rejects.toEqual(
      new Error('Device fingerprint could not be verified')
    );
    expect(next).not.toBeCalled();
  });

  it('Should pass validation if device fingerprinting is not enabled', async () => {
    context.requestContext.gatewaySettings.deviceFingerprintEnabled = false;

    await deviceFingerprintSessionIdValidator(context, next);

    expect(next).toBeCalledTimes(1);
  });
});
