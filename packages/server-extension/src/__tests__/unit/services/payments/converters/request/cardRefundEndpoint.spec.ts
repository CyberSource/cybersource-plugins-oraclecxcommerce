import createRefundPaymentRequest from '@server-extension/services/payments/converters/request/refundEndpoint';

describe('Refund Payment Endpoint Request Converter', () => {
  it('Should create refund request using the provided data', () => {
    const refundRequest = createRefundPaymentRequest({
      merchantReferenceNumber: 'test',
      transactionId: '1234',
      currency: 'USD',
      amount: '10050'
    });

    expect(refundRequest).toMatchObject({
      clientReferenceInformation: {
        code: 'test'
      },
      processingInformation: {
        commerceIndicator: 'internet'
      },
      orderInformation: {
        amountDetails: {
          totalAmount: '100.50',
          currency: 'USD'
        }
      }
    });
  });
});
