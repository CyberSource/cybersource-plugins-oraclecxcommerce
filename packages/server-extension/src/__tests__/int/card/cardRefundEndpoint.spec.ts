import { sendPaymentRefundRequest, sendPaymentRequest, verifyErrorPaths } from '../common';
import { captureRequest, refundEndpointRequest } from '../data/webhook/common';
import { cardAuthRequest } from './common';

describe.skipNotSupported('Payment Refund Endpoint', 'card', () => {
  it('Should handle credit card refund', async () => {
    const authorization = await sendPaymentRequest(cardAuthRequest).expect(200);
    const capture = await sendPaymentRequest(
      captureRequest(authorization.body.authorizationResponse.hostTransactionId)
    ).expect(200);

    const refund = await sendPaymentRefundRequest(
      refundEndpointRequest(capture.body.captureResponse.hostTransactionId)
    ).expect(200);

    expect(refund.body).toMatchObject({
      hostTransactionTimestamp: expect.any(String),
      amount: '000000122526',
      responseCode: '3000',
      responseReason: 'PENDING',
      merchantTransactionId: 'o30446',
      hostTransactionId: expect.any(String),
      merchantTransactionTimestamp: expect.any(String)
    });
  });

  it('Should fail with wrong capture transaction id', async () => {
    const refund = await sendPaymentRefundRequest(refundEndpointRequest('WRONG_ID')).expect(500);

    expect(refund.body).toMatchObject({
      status: 500
    });
  });

  it('Should fail when the request data is not valid', async () => {
    const invalidRequest = {
      currency: 'TEST',
      transactionId: '',
      amount: 'TEST',
      merchantReferenceNumber: 'TEST@@'
    };

    const expectedErrorPaths = [
      'body:currency',
      'body:transactionId',
      'body:amount',
      'body:merchantReferenceNumber'
    ];

    const refund = await sendPaymentRefundRequest(invalidRequest).expect(400);

    verifyErrorPaths(refund.body.errors, expectedErrorPaths);
    expect(refund.body).toMatchObject({
      status: 400,
      message: 'Request validation has failed. Please check your input'
    });
  });
});
