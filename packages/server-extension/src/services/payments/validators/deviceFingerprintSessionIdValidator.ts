import { middleware, PaymentContext } from '@server-extension/common';
import cryptoService from '@server-extension/services/cryptoService';

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

function validateDeviceFingerprintSessionId(context: PaymentContext) {
  const { customProperties } = context.webhookRequest;
  if (context.requestContext.gatewaySettings.deviceFingerprintEnabled) {
    const sessionId = customProperties?.deviceFingerprintSessionId;
    validateSessionId(
      sessionId,
      customProperties?.deviceFingerprintCipherEncrypted,
      customProperties?.deviceFingerprintCipherIv
    );
  }
}

export default middleware(validateDeviceFingerprintSessionId);
