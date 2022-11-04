import cryptoService from '@server-extension/services/cryptoService';
import { Request, Response } from 'express';

function validateSessionId(sessionId?: string, encryptedData?: string, iv?: string) {
  if (
    !sessionId ||
    !encryptedData ||
    !iv ||
    !cryptoService.validate(sessionId, {
      encrypted: encryptedData,
      iv
    })
  ) {
    throw new Error('Device fingerprint could not be verified');
  }
}

export default function validateDeviceFingerprintSessionId(req: Request, res: Response) {
  const { customProperties } = req.body;
  if (req.app.locals.gatewaySettings.deviceFingerprintEnabled) {
    const sessionId = customProperties?.deviceFingerprintSessionId;
    validateSessionId(
      sessionId,
      customProperties?.deviceFingerprintCipherEncrypted,
      customProperties?.deviceFingerprintCipherIv
    );
  }
}
