import occClient from '@server-extension/services/occ/occClient';
import { mocked } from 'ts-jest/utils';
import { sendPaymentRequest, verifyCardResponse } from '../common';
import { authReversalRequest } from '../data/webhook/common';
import { cardAuthRequest, paymentGroup } from './common';

describe.skipNotSupported('Generic Webhook Request - Card Authorization Reversal', 'card', () => {
  it('Should handle credit card authorization reversal', async () => {
    const authorization = await sendPaymentRequest(cardAuthRequest).expect(200);

    const request = authReversalRequest(authorization.body.authorizationResponse.hostTransactionId);
    const response = await sendPaymentRequest(request).expect(200);

    verifyCardResponse(request, response.body);
    expect(response.body.voidResponse).toMatchObject({
      authCode: 'REVERSED',
      responseCode: '2000',
      responseReason: 'REVERSED',
      responseDescription: 'REVERSED'
    });
  });

  it('Should fail with wrong auth transaction id', async () => {
    const request = authReversalRequest('invalid_id');
    const response = await sendPaymentRequest(request).expect(200);

    verifyCardResponse(request, response.body);
    expect(response.body.voidResponse).toMatchObject({
      authCode: 'DECLINED',
      responseCode: '8000',
      responseReason: 'DECLINED',
      responseDescription: 'An error occurred during execution of exports:authReversal'
    });
  });

  it('Should handle credit card authorization reversal when no reference info provided', async () => {
    const authorization = await sendPaymentRequest(cardAuthRequest).expect(200);

    mocked(occClient.getOrder).mockResolvedValueOnce({
      paymentGroups: [
        paymentGroup(
          authorization.body.authorizationResponse.hostTransactionId,
          cardAuthRequest.paymentId,
          'AUTHORIZED'
        )
      ]
    });

    const request = authReversalRequest();
    const response = await sendPaymentRequest(request).expect(200);

    verifyCardResponse(request, response.body);
    expect(response.body.voidResponse).toMatchObject({
      responseCode: '2000'
    });
  });
});
