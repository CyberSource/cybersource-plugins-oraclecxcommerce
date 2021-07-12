import { RequestContext } from '@server-extension/common';
import cryptoService from '@server-extension/services/cryptoService';
import generateKey from './api/generateKey';

export async function createCaptureContext(
  requestContext: RequestContext,
  captureContextPayload: OCC.CaptureContextRequest
): Promise<OCC.CaptureContextResponse> {
  const keyObj = await generateKey(requestContext, captureContextPayload.targetOrigin);

  return {
    captureContext: keyObj.keyId,
    cipher: cryptoService.encrypt(keyObj.keyId)
  };
}
