import { RequestContext } from '@server-extension/common';
import makeRequest from '@server-extension/services/payments/api/paymentCommand';
import createCapturePaymentRequest from '@server-extension/services/payments/converters/request/captureEndpoint';
import createCapturePaymentResponse from '@server-extension/services/payments/converters/response/captureEndpoint';
import { capturePayment } from '@server-extension/services/payments/paymentCaptureService';
import {
  CapturePaymentRequest,
  PtsV2PaymentsCapturesPost201Response
} from 'cybersource-rest-client';
import { mock } from 'jest-mock-extended';
import { mocked } from 'ts-jest/utils';

jest.mock('@server-extension/services/payments/converters/response/captureEndpoint');
jest.mock('@server-extension/services/payments/api/paymentCommand');
jest.mock('@server-extension/services/payments/converters/request/captureEndpoint');
jest.mock('cybersource-rest-client');

describe('Payment Capture Service', () => {
  it('Should capture payment using capture request payload', async () => {
    const requestContext = mock<RequestContext>();
    const captureCybsRequest = mock<CapturePaymentRequest>();
    const captureCybsResponse = mock<PtsV2PaymentsCapturesPost201Response>();
    const capturePaymentRequest = {
      currency: 'USD',
      transactionId: '',
      amount: '000000122526',
      merchantReferenceNumber: 'o30446'
    };

    mocked(makeRequest).mockResolvedValueOnce(captureCybsResponse);
    mocked(createCapturePaymentRequest).mockReturnValueOnce(captureCybsRequest);

    await capturePayment(capturePaymentRequest, requestContext);

    expect(makeRequest).toBeCalledTimes(1);
    expect(createCapturePaymentRequest).toBeCalledTimes(1);
    expect(createCapturePaymentRequest).toBeCalledWith(capturePaymentRequest);
    expect(createCapturePaymentResponse).toBeCalledTimes(1);
    expect(createCapturePaymentResponse).toBeCalledWith(captureCybsResponse);
  });
});
