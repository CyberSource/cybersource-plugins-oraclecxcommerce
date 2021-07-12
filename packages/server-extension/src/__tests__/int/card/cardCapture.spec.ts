import occClient from '@server-extension/services/occ/occClient';
import { mocked } from 'ts-jest/utils';
import { sendPaymentRequest, verifyCardResponse } from '../common';
import { captureRequest } from '../data/webhook/common';
import { cardAuthRequest, paymentGroup } from './common';

describe.skipNotSupported('Generic Webhook Request - Card Payments', 'card', () => {
  it('Should handle credit card capture', async () => {
    const authorization = await sendPaymentRequest(cardAuthRequest).expect(200);

    const request = captureRequest(authorization.body.authorizationResponse.hostTransactionId);
    const response = await sendPaymentRequest(request).expect(200);

    verifyCardResponse(request, response.body);
    expect(response.body.captureResponse).toMatchObject({
      authCode: 'PENDING',
      responseCode: '11000',
      responseReason: 'PENDING',
      responseDescription: 'PENDING'
    });
  });

  it('Should fail with wrong auth transaction id', async () => {
    const request = captureRequest('wrong id');
    const response = await sendPaymentRequest(request).expect(200);

    verifyCardResponse(request, response.body);
    expect(response.body.captureResponse).toMatchObject({
      authCode: 'DECLINED',
      responseCode: '12000',
      responseReason: 'DECLINED',
      responseDescription: 'An error occurred during execution of exports:capturePayment'
    });
  });

  it('Should handle credit card capture when no reference info provided', async () => {
    const authorization = await sendPaymentRequest(cardAuthRequest).expect(200);
    const request = captureRequest(authorization.body.authorizationResponse.hostTransactionId);

    mocked(occClient.getOrder).mockResolvedValueOnce({
      paymentGroups: [
        paymentGroup(
          authorization.body.authorizationResponse.hostTransactionId,
          cardAuthRequest.paymentId,
          'AUTHORIZED'
        )
      ]
    });

    request.referenceInfo = undefined;
    const response = await sendPaymentRequest(request).expect(200);

    verifyCardResponse(request, response.body);
    expect(response.body.captureResponse).toMatchObject({
      responseCode: '11000'
    });
  });
});
