import { itif } from '../common';
import { RequestBuilder } from '../data/webhook/common';

export const googlePayAuthRequest = new RequestBuilder()
  .transactionType('0100')
  .paymentMethod('generic')
  .build({
    customProperties: {
      paymentType: 'googlepay',
      paymentToken: ''
    }
  });

it.skipNotSupported = itif(Boolean(googlePayAuthRequest.customProperties?.paymentToken));
