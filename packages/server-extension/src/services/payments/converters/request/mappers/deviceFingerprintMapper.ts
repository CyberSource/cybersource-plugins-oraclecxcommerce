import { PaymentContext } from '@server-extension/common';
import { CreatePaymentRequest } from 'cybersource-rest-client';
import { PaymentRequestMapper } from '../../common';

export const deviceFingerprintMapper: PaymentRequestMapper = {
  supports: (context: PaymentContext) =>
    Boolean(context.requestContext.gatewaySettings.deviceFingerprintEnabled),

  map: (context: PaymentContext) => {
    const { webhookRequest } = context;
    const sessionId = webhookRequest.customProperties?.deviceFingerprintSessionId;
    const merchantID = <string>context.getSetting('merchantID');

    return <CreatePaymentRequest>{
      deviceInformation: {
        fingerprintSessionId: sessionId?.replace(merchantID, '') || ''
      }
    };
  }
};
