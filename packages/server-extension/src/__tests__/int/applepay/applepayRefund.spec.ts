import { sendPaymentRequest, verifyResponse } from '../common';
import { captureRequest, refundRequest } from '../data/webhook/common';
import { applePayAuthRequest } from './common';

describe.skipNotSupported('Generic Webhook Request - Apple Pay Payments', 'applepay', () => {
  it('Should handle apple pay refund capture', async () => {
    const authorization = await sendPaymentRequest(applePayAuthRequest).expect(200);
    const capture = await sendPaymentRequest(
      captureRequest(authorization.body.hostTransactionId, 'generic')
    ).expect(200);

    const request = refundRequest(capture.body.hostTransactionId, 'generic');
    const response = await sendPaymentRequest(request).expect(200);

    verifyResponse(request, response.body);
    expect(response.body.response).toMatchObject({
      code: '3000',
      reason: 'PENDING',
      success: true
    });
  });
});
