import { sendPaymentRequest, verifyResponse } from '../common';
import { captureRequest } from '../data/webhook/common';
import { googlePayAuthRequest } from './common';

describe.skipNotSupported('Generic Webhook Request - Google Pay Payments', 'googlepay', () => {
  it.skipNotSupported('Should handle google pay capture', async () => {
    const authorization = await sendPaymentRequest(googlePayAuthRequest).expect(200);

    const request = captureRequest(authorization.body.hostTransactionId, 'generic');
    const response = await sendPaymentRequest(request).expect(200);

    verifyResponse(request, response.body);
    expect(response.body.response).toMatchObject({
      code: '11000',
      reason: 'PENDING'
    });
  });
});
