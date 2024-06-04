import { RequestContext } from '../../common/index';
import cryptoService from '../cryptoService';
import occClient from '../occ/occClient';
import generateKey from './api/generateKey';
import jwtService from '@server-extension/services/jwtService';
import publicKeyApi from '@server-extension/services/publicKeyApi';
import makeRequest from './api/paymentCommand';
const { LogFactory } = require('@isv-occ-payment/occ-payment-factory');

export async function createCaptureContext(
  requestContext: RequestContext,
  captureContextPayload: OCC.CaptureContextRequest
): Promise<OCC.CaptureContextResponse> {
  const logger = LogFactory.logger();
  const enabledCardTypesDetails = (await occClient.getCardTypes())?.items || [];
  const possibleCardTypes = ["VISA", "MAESTRO", "MASTERCARD", "AMEX", "DISCOVER", "DINERSCLUB", "JCB", "CUP", "CARTESBANCAIRES", "CARNET"];
  const defaultCardTypes = ["VISA", "MASTERCARD"];
  let enabledCardTypes = possibleCardTypes.filter(cybsType => enabledCardTypesDetails.some((enabledCardTypeDetails: { repositoryId: string; }) =>
    cybsType.includes(enabledCardTypeDetails.repositoryId.toUpperCase())));
  if (!enabledCardTypes || enabledCardTypes?.length < 1) {
    enabledCardTypes = defaultCardTypes;
  }
  const keyObj = await generateKey(requestContext, captureContextPayload.targetOrigin, enabledCardTypes);
  const contextResponse = "object" === typeof keyObj ? keyObj.toString() : keyObj;
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
