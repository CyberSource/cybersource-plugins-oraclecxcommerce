import occClient from '@server-extension/services/occ/occClient';
import { mocked } from 'ts-jest/utils';
import { sendPaymentRequest, verifyCardResponse } from '../common';
import { captureRequest, refundRequest } from '../data/webhook/common';
import { cardAuthRequest, paymentGroup } from './common';

describe.skipNotSupported('Generic Webhook Request - Card Payments', 'card', () => {
  it('Should handle credit card refund capture', async () => {
    const authorization = await sendPaymentRequest(cardAuthRequest).expect(200);
    const capture = await sendPaymentRequest(
      captureRequest(authorization.body.authorizationResponse.hostTransactionId)
    ).expect(200);

    const request = refundRequest(capture.body.captureResponse.hostTransactionId);
    const response = await sendPaymentRequest(request).expect(200);

    verifyCardResponse(request, response.body);
    expect(response.body.creditResponse).toMatchObject({
      authCode: 'PENDING',
      responseCode: '3000',
      responseReason: 'PENDING',
      responseDescription: 'PENDING'
    });
  });

  it('Should fail with wrong capture transaction id', async () => {
    const request = refundRequest('wrong id');
    const response = await sendPaymentRequest(request).expect(200);

    verifyCardResponse(request, response.body);
    expect(response.body.creditResponse).toMatchObject({
      authCode: 'DECLINED',
      responseCode: '7000',
      responseReason: 'DECLINED',
      responseDescription: 'An error occurred during execution of exports:refundCapture'
    });
  });

  it('Should handle credit card refund when no reference info provided', async () => {
    const authorization = await sendPaymentRequest(cardAuthRequest).expect(200);
    await sendPaymentRequest(
      captureRequest(authorization.body.authorizationResponse.hostTransactionId)
    ).expect(200);

    mocked(occClient.getOrder).mockResolvedValueOnce({
      paymentGroups: [
        paymentGroup(
          authorization.body.authorizationResponse.hostTransactionId,
          cardAuthRequest.paymentId,
          'SETTLED'
        )
      ]
    });

    const request = refundRequest();
    request.referenceInfo = undefined;
    const response = await sendPaymentRequest(request).expect(200);

    verifyCardResponse(request, response.body);
    expect(response.body.creditResponse).toMatchObject({
      responseCode: '3000'
    });
  });
});
