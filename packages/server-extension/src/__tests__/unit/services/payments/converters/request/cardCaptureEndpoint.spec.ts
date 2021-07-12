import createCapturePaymentRequest from '@server-extension/services/payments/converters/request/captureEndpoint';

describe('Capture Payment Endpoint Request Converter', () => {
  it('Should create capture request using the provided data', () => {
    const capturePaymentRequest = {
      currency: 'USD',
      transactionId: '',
      amount: '000000122526',
      merchantReferenceNumber: 'o30446'
    };

    const captureRequestCybs = createCapturePaymentRequest(capturePaymentRequest);

    expect(captureRequestCybs).toMatchObject({
      clientReferenceInformation: {
        code: 'o30446'
      },
      processingInformation: {
        commerceIndicator: 'internet'
      },
      orderInformation: {
        amountDetails: {
          totalAmount: '1225.26',
          currency: 'USD'
        }
      }
    });
  });
});
