import { PaymentContext } from '@server-extension/common';
import { CreatePaymentRequest } from 'cybersource-rest-client';
import { PaymentRequestMapper } from '../../common';

export const transientTokenInfoMapper: PaymentRequestMapper = {
  supports: (context: PaymentContext) => {
    const { webhookRequest } = context;

    return Boolean(
      webhookRequest.customProperties?.transientTokenJwt && !webhookRequest.cardDetails?.token
    );
  },

  map: (context: PaymentContext) => {
    const { webhookRequest } = context;

    return <CreatePaymentRequest>{
      tokenInformation: {
        transientTokenJwt: webhookRequest.customProperties?.transientTokenJwt
      }
    };
  }
};
