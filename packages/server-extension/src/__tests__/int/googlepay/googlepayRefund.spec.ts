import { sendPaymentRequest, verifyResponse } from '../common';
import { captureRequest, refundRequest } from '../data/webhook/common';
import { googlePayAuthRequest } from './common';

describe.skipNotSupported('Generic Webhook Request - Google Pay Payments', 'googlepay', () => {
  it.skipNotSupported('Should handle google pay refund capture', async () => {
    const authorization = await sendPaymentRequest(googlePayAuthRequest).expect(200);
    const capture = await sendPaymentRequest(
      captureRequest(authorization.body.hostTransactionId, 'generic')
    ).expect(200);

    const request = refundRequest(capture.body.hostTransactionId, 'generic');
    const response = await sendPaymentRequest(request).expect(200);

    verifyResponse(request, response.body);
    expect(response.body.response).toMatchObject({
      code: '3000',
      reason: 'PENDING'
    });
  });
});
