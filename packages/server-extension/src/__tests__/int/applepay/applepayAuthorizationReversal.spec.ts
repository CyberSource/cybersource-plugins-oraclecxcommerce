import { sendPaymentRequest, verifyResponse } from '../common';
import { authReversalRequest } from '../data/webhook/common';
import { applePayAuthRequest } from './common';

describe.skipNotSupported('Generic Webhook Request - Apple Pay Payments', 'applepay', () => {
  it('Should handle apple pay authorization reversal', async () => {
    const authorization = await sendPaymentRequest(applePayAuthRequest).expect(200);

    const request = authReversalRequest(authorization.body.hostTransactionId, 'generic');
    const response = await sendPaymentRequest(request).expect(200);

    verifyResponse(request, response.body);
    expect(response.body.response).toMatchObject({
      code: '2000',
      reason: 'REVERSED',
      success: true
    });
  });

  it('Should fail with wrong auth transaction id', async () => {
    const request = authReversalRequest('6007813048496839803006', 'generic');
    const response = await sendPaymentRequest(request).expect(200);

    verifyResponse(request, response.body);
    expect(response.body.response).toMatchObject({
      code: '8000',
      reason: 'DECLINED',
      responseDescription: 'An error occurred during execution of exports:authReversal',
      success: false
    });
  });
});
