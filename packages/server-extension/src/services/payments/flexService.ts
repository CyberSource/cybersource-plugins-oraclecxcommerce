import { RequestContext } from '../../common/index';
import cryptoService from '../cryptoService';
import occClient from '../occ/occClient';
import generateKey from './api/generateKey';
import jwtService from '@server-extension/services/jwtService';
import publicKeyApi from '@server-extension/services/publicKeyApi';
import makeRequest from './api/paymentCommand';
import * as path from 'path';
import { decryptMleResponse, isMleEncryptedResponse, withP12Extension } from '../../utils/mleDecryptionUtils';
import { POSSIBLE_CARD_TYPES, DEFAULT_CARD_TYPES } from './cardTypeConstants';
const { LogFactory } = require('@isv-occ-payment/occ-payment-factory');

export async function createCaptureContext(
  requestContext: RequestContext,
  captureContextPayload: OCC.CaptureContextRequest
): Promise<OCC.CaptureContextResponse> {
  const logger = LogFactory.logger();
  const enabledCardTypesDetails = (await occClient.getCardTypes(requestContext?.siteId))?.items || [];
  let enabledCardTypes = POSSIBLE_CARD_TYPES.filter(cybsType => enabledCardTypesDetails.some((enabledCardTypeDetails: { repositoryId: string; }) =>
    cybsType.includes(enabledCardTypeDetails.repositoryId.toUpperCase())));
  if (!enabledCardTypes || enabledCardTypes?.length < 1) {
    enabledCardTypes = DEFAULT_CARD_TYPES;
  }
  const keyObj = await generateKey(requestContext, captureContextPayload.targetOrigin, enabledCardTypes);
  let contextResponse = "object" === typeof keyObj ? keyObj.toString() : keyObj;

  // When MLE is enabled the SDK returns {"encryptedResponse":"<JWE>"} instead of decrypting.
  // Manually decrypt using the configured response MLE P12.
  if (isMleEncryptedResponse(contextResponse)) {
    logger.debug('[MLE] Capture context response is MLE encrypted — decrypting manually');
    // flex.ts passes res.locals as requestContext, so gatewaySettings is nested under requestContext
    const settings = requestContext.requestContext?.gatewaySettings || requestContext.gatewaySettings;
    if (settings?.responseMlePrivateKeyFileName && settings?.responseMlePrivateKeyPass) {
      const certsDir = path.join(__dirname, '../../../certs');
      const p12Path = path.join(certsDir, withP12Extension(settings.responseMlePrivateKeyFileName));
      const decrypted = await decryptMleResponse(contextResponse, p12Path, settings.responseMlePrivateKeyPass);
      if (decrypted) {
        contextResponse = decrypted;
        logger.debug('[MLE] Capture context decrypted successfully');
      } else {
        logger.error('[MLE] Failed to decrypt capture context — proceeding with encrypted response');
      }
    } else {
      logger.error('[MLE] MLE encrypted response detected but no P12 config found in gateway settings');
    }
  }

  const keyId = jwtService.getKid(contextResponse);
  const getPublicKey: any = await makeRequest(
    requestContext.merchantConfig,
    publicKeyApi,
    "getPublicKey",
    keyId
  )
  jwtService.signatureVerify(contextResponse, getPublicKey);
  logger.debug("Generate Key : Capture context validation is successful");
  return {
    captureContext: contextResponse,
    cipher: cryptoService.encrypt(contextResponse)
  };
}
