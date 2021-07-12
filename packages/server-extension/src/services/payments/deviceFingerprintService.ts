import cryptoService from '@server-extension/services/cryptoService';
import crypto from 'crypto';

export function generateDeviceFingerPrintData(
  gatewaySettings: OCC.GatewaySettings
): OCC.DeviceFingerprintData {
  const random = crypto.randomBytes(10).toString('hex');
  const sessionId = `${gatewaySettings.merchantID}${random}_${Date.now()}`;

  return { sessionId, cipher: cryptoService.encrypt(sessionId) };
}
