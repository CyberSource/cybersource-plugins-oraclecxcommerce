import createCapturePaymentResponse from '@server-extension/services/payments/converters/response/captureEndpoint';
import capturePaymentResponse from '../../../../data/cardCaptureResponse.json';

describe('Capture Payment Endpoint Response Converter', () => {
  it('Should create capture response using the provided data', () => {
    const captureResponseCybs = createCapturePaymentResponse(capturePaymentResponse);

    expect(captureResponseCybs).toMatchObject({
      hostTransactionTimestamp: '2020-08-07T12:33:23Z',
      amount: '000000122526',
      hostTransactionId: '5968036030686731604006',
      merchantTransactionId: 'o30446',
      responseCode: '11000',
      responseReason: 'PENDING',
      merchantTransactionTimestamp: expect.any(String)
    });
  });
});
