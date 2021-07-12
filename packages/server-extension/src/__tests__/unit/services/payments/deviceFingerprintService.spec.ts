import { generateDeviceFingerPrintData } from '@server-extension/services/payments/deviceFingerprintService';
import { mockDeep, mockReset } from 'jest-mock-extended';

jest.mock('@server-extension/services/cacheService');

describe('Device Fingerprint Service', () => {
  const gatewaySettings = mockDeep<OCC.GatewaySettings>();
  const orgId = 'orgId';
  const merchantId = 'merchantId';

  beforeEach(() => {
    mockReset(gatewaySettings);
    gatewaySettings.deviceFingerprintEnabled = true;
    gatewaySettings.deviceFingerprintOrgId = orgId;
    gatewaySettings.merchantID = merchantId;
  });

  it('Should generate device fingerprint data', () => {
    const res = generateDeviceFingerPrintData(gatewaySettings);

    expect(res.cipher).toBeDefined();
    expect(res.sessionId).toMatch('merchantId');
  });
});
