import { sendPaymentRequest, verifyResponse } from '../common';
import { captureRequest } from '../data/webhook/common';
import { applePayAuthRequest } from './common';

describe.skipNotSupported('Generic Webhook Request - Apple Pay Payments', 'applepay', () => {
  it('Should handle apple pay capture', async () => {
    const authorization = await sendPaymentRequest(applePayAuthRequest).expect(200);

    const request = captureRequest(authorization.body.hostTransactionId, 'generic');
    const response = await sendPaymentRequest(request).expect(200);

    verifyResponse(request, response.body);
    expect(response.body.response).toMatchObject({
      code: '11000',
      reason: 'PENDING',
      success: true
    });
  });
});
