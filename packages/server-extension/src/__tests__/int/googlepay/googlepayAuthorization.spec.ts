import { sendPaymentRequest, verifyResponse } from '../common';
import { gatewaySettings } from '../data/gatewaySettings';
import { googlePayAuthRequest } from './common';

describe.skipNotSupported('Generic Webhook Request - Google Pay Payments', 'googlepay', () => {
  it.skipNotSupported('Should handle google pay authorization', async () => {
    const response = await sendPaymentRequest(googlePayAuthRequest).expect(200);

    verifyResponse(googlePayAuthRequest, response.body);
    expect(response.body.response).toMatchObject({
      code: '1000',
      reason: 'AUTHORIZED',
      success: true
    });
  });

  it.skipNotSupported('Should skip decision manager', async () => {
    gatewaySettings.dmDecisionSkip = 'googlepay,card,applepay';
    googlePayAuthRequest.billingAddress.firstName = 'Review';

    const response = await sendPaymentRequest(googlePayAuthRequest).expect(200);

    verifyResponse(googlePayAuthRequest, response.body);
    expect(response.body.response).toMatchObject({
      code: '1000',
      reason: 'AUTHORIZED_PENDING_REVIEW',
      success: true
    });
  });
});
