import { RequestContext } from '@server-extension/common';
import makeRequest from '@server-extension/services/payments/api/paymentCommand';
import cardRefundPaymentRequest from '@server-extension/services/payments/converters/request/refundEndpoint';
import cardRefundPaymentResponse from '@server-extension/services/payments/converters/response/refundEndpoint';
import refundPayment from '@server-extension/services/payments/paymentRefundService';
import { PtsV2PaymentsRefundPost201Response, RefundCaptureRequest } from 'cybersource-rest-client';
import { mock } from 'jest-mock-extended';
import { mocked } from 'ts-jest/utils';

jest.mock('@server-extension/services/payments/converters/request/refundEndpoint');
jest.mock('@server-extension/services/payments/converters/response/refundEndpoint');
jest.mock('@server-extension/services/payments/api/paymentCommand');
jest.mock('cybersource-rest-client');

describe('Payment Refund Service', () => {
  it('Should refund payment', async () => {
    const requestContext = mock<RequestContext>();
    const refundCybsRequest = mock<RefundCaptureRequest>();
    const refundCybsResponse = mock<PtsV2PaymentsRefundPost201Response>();
    mocked(makeRequest).mockResolvedValue(refundCybsResponse);
    mocked(cardRefundPaymentRequest).mockReturnValue(refundCybsRequest);
    mocked(cardRefundPaymentResponse).mockReturnValue(refundCaptureResponse);

    const res = await refundPayment(refundCaptureRequest, requestContext);

    expect(makeRequest).toBeCalledTimes(1);
    expect(cardRefundPaymentRequest).toBeCalledTimes(1);
    expect(cardRefundPaymentRequest).toBeCalledWith(refundCaptureRequest);
    expect(cardRefundPaymentResponse).toBeCalledTimes(1);
    expect(cardRefundPaymentResponse).toBeCalledWith(refundCybsResponse);
    expect(res).toMatchObject(refundCaptureResponse);
  });
});

const refundCaptureRequest = {
  merchantReferenceNumber: 'test',
  transactionId: '123',
  currency: 'GBP',
  amount: '10050'
};

const refundCaptureResponse = {
  hostTransactionTimestamp: '2020-08-13T10:08:05Z',
  amount: '100.50',
  responseCode: '1000',
  responseReason: 'PENDING',
  merchantTransactionId: 'test',
  hostTransactionId: '5973132857396965504006',
  merchantTransactionTimestamp: '2020-08-13T10:08:05Z'
};
