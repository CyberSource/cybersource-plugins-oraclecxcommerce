import processAuthorizationReversal from './api/processAuthorizationReversal';
import processCapture from './api/processCapture';
import processPayment from './api/processPayment';
import processRefund from './api/processRefund';
import {
  applepayAuthorizationRequest,
  authorizationReversalRequest,
  captureRequest,
  cardAuthorizationRequest,
  googlepayAuthorizationRequest,
  referenceInfoFallback,
  refundRequest
} from './converters/request';
import {
  apiCardErrorResponse,
  apiGenericErrorResponse,
  authorizationResponse,
  authorizationReversalResponse,
  captureResponse,
  genericAuthorizationResponse,
  genericAuthorizationReversalResponse,
  genericCaptureResponse,
  genericRefundResponse,
  refundResponse
} from './converters/response';
import GenericPaymentDispatcher from './paymentDispatcher';
import validateAuthJwt from './validators/authJwtValidator';
import validateDeviceFingerprintSessionId from './validators/deviceFingerprintSessionIdValidator';
import validateTransientToken from './validators/transientTokenValidator';

export const dispatcher = new GenericPaymentDispatcher();

// Payment - Authorization
dispatcher
  .use(
    'card_0100',
    validateTransientToken,
    validateAuthJwt,
    validateDeviceFingerprintSessionId,
    cardAuthorizationRequest,
    processPayment,
    authorizationResponse
  )
  .catch(apiCardErrorResponse);

dispatcher
  .use(
    'generic_googlepay_0100',
    validateDeviceFingerprintSessionId,
    googlepayAuthorizationRequest,
    processPayment,
    genericAuthorizationResponse
  )
  .catch(apiGenericErrorResponse);

dispatcher
  .use(
    'generic_applepay_0100',
    validateDeviceFingerprintSessionId,
    applepayAuthorizationRequest,
    processPayment,
    genericAuthorizationResponse
  )
  .catch(apiGenericErrorResponse);

// Payment - Capture
const captureHandlers = [referenceInfoFallback, captureRequest, processCapture];
dispatcher.use('card_0200', ...captureHandlers, captureResponse).catch(apiCardErrorResponse);
dispatcher
  .use('generic_0200', ...captureHandlers, genericCaptureResponse)
  .catch(apiGenericErrorResponse);

// Payment - Refund
const refundHandlers = [referenceInfoFallback, refundRequest, processRefund];
dispatcher.use('card_0400', ...refundHandlers, refundResponse).catch(apiCardErrorResponse);
dispatcher
  .use('generic_0400', ...refundHandlers, genericRefundResponse)
  .catch(apiGenericErrorResponse);

// Payment - Authorization Reversal
const authReversalHandlers = [
  referenceInfoFallback,
  authorizationReversalRequest,
  processAuthorizationReversal
];
dispatcher
  .use('card_0110', ...authReversalHandlers, authorizationReversalResponse)
  .catch(apiCardErrorResponse);
dispatcher
  .use('generic_0110', ...authReversalHandlers, genericAuthorizationReversalResponse)
  .catch(apiGenericErrorResponse);
