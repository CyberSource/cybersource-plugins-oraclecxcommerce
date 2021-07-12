import { sendPaymentCaptureRequest, sendPaymentRequest, verifyErrorPaths } from '../common';
import { captureEndpointRequest } from '../data/webhook/common';
import { cardAuthRequest } from './common';

describe.skipNotSupported('Card Payment Capture Endpoint', 'card', () => {
  it('Should handle credit card capture', async () => {
    const authorization = await sendPaymentRequest(cardAuthRequest).expect(200);

    const capturePaymentRequest = captureEndpointRequest(
      authorization.body.authorizationResponse.hostTransactionId
    );

    const capture = await sendPaymentCaptureRequest(capturePaymentRequest).expect(200);

    expect(capture.body).toMatchObject({
      amount: capturePaymentRequest.amount,
      merchantTransactionId: capturePaymentRequest.merchantReferenceNumber,
      responseCode: '11000',
      responseReason: 'PENDING',
      hostTransactionId: expect.any(String)
    });
  });

  it('Should fail to capture payment when the cybs validation fails', async () => {
    const capture = await sendPaymentCaptureRequest(captureEndpointRequest('WRONG_ID')).expect(500);

    expect(capture.body).toMatchObject({
      status: 500,
      message: 'An error occurred while executing request'
    });
  });

  it('Should fail to capture payment when the request data is invalid ', async () => {
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

    const capture = await sendPaymentCaptureRequest(invalidRequest).expect(400);

    verifyErrorPaths(capture.body.errors, expectedErrorPaths);
    expect(capture.body).toMatchObject({
      status: 400,
      message: 'Request validation has failed. Please check your input'
    });
  });
});
