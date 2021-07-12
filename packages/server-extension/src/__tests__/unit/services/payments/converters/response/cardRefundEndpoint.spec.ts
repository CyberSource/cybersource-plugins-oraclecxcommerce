import createRefundPaymentResponse from '@server-extension/services/payments/converters/response/refundEndpoint';

describe('Refund Payment Endpoint Request Converter', () => {
  it('Should create refund request using the provided data', () => {
    const refundRequest = createRefundPaymentResponse({
      clientReferenceInformation: { code: 'test' },
      id: '5973132857396965504006',
      reconciliationId: '6100038256',
      refundAmountDetails: { currency: 'USD', refundAmount: '100.50' },
      status: 'PENDING',
      submitTimeUtc: '2020-08-13T10:08:05Z'
    });

    expect(refundRequest).toMatchObject({
      hostTransactionTimestamp: '2020-08-13T10:08:05Z',
      amount: '000000010050',
      responseCode: '3000',
      responseReason: 'PENDING',
      merchantTransactionId: 'test',
      hostTransactionId: '5973132857396965504006',
      merchantTransactionTimestamp: '2020-08-13T10:08:05Z'
    });
  });
});
