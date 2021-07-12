import { PaymentContext } from '@server-extension/common';
import { deviceFingerprintMapper } from '@server-extension/services/payments/converters/request/mappers';
import { mockDeep } from 'jest-mock-extended';

jest.mock('@server-extension/services/cacheService');

describe('Converters - Request Mappers', () => {
  const context = mockDeep<PaymentContext>();

  it.each`
    deviceFingerprintEnabled | supported
    ${true}                  | ${true}
    ${false}                 | ${false}
    ${undefined}             | ${false}
  `(
    'should return $supported when deviceFingerprintEnabled is $deviceFingerprintEnabled',
    ({ deviceFingerprintEnabled, supported }) => {
      context.requestContext.gatewaySettings.deviceFingerprintEnabled = deviceFingerprintEnabled;

      expect(deviceFingerprintMapper.supports(context)).toBe(supported);
    }
  );

  it('Should add device fingerprint session ID on the request', () => {
    context.webhookRequest.customProperties = { deviceFingerprintSessionId: 'sessionId' };

    const mappedRequest = deviceFingerprintMapper.map(context);

    expect(mappedRequest).toMatchObject({
      deviceInformation: {
        fingerprintSessionId: 'sessionId'
      }
    });
  });
});
