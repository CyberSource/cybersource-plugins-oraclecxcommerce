import { PaymentContext } from '@server-extension/common';
import {
  mapConsumerAuthToken,
  payerAuthMapper
} from '@server-extension/services/payments/converters/response/mappers';
import { PtsV2PaymentsPost201Response } from 'cybersource-rest-client';
import { mockDeep, mockReset } from 'jest-mock-extended';

describe('Converters - Response Mappers', () => {
  const context = mockDeep<PaymentContext>();

  beforeEach(() => {
    mockReset(context);
  });

  it.each`
    status                      | supported
    ${'PENDING_AUTHENTICATION'} | ${true}
    ${'any'}                    | ${false}
  `('should return $supported when payment status is $status', ({ status, supported }) => {
    context.data.response = { status: status };

    expect(payerAuthMapper.supports(context)).toBe(supported);
  });

  it('Should map consumer auth token', () => {
    const info = { token: 'consumerAuthToken' };

    expect(mapConsumerAuthToken(info)).toBe('consumerAuthToken');
  });

  it('Should return Payer Auth Fields', () => {
    context.data.response = mockDeep<DeepRequired<PtsV2PaymentsPost201Response>>();
    const { consumerAuthenticationInformation } = context.data.response;

    const mappedRequest = payerAuthMapper.map(context);

    expect(mappedRequest).toMatchObject({
      authorizationResponse: {
        additionalProperties: {
          action: 'validateConsumerAuthentication',
          acsUrl: consumerAuthenticationInformation.acsUrl,
          xid: consumerAuthenticationInformation.xid,
          authenticationTransactionId:
            consumerAuthenticationInformation.authenticationTransactionId,
          pareq: consumerAuthenticationInformation.pareq,
          veresEnrolled: consumerAuthenticationInformation.veresEnrolled,
          proxyPan: consumerAuthenticationInformation.proxyPan,
          authenticationPath: consumerAuthenticationInformation.authenticationPath,
          proofXml: consumerAuthenticationInformation.proofXml,
          specificationVersion: consumerAuthenticationInformation.specificationVersion,
          token: mapConsumerAuthToken(consumerAuthenticationInformation)
        },
        customPaymentProperties: ['authenticationTransactionId', 'acsUrl', 'pareq', 'action']
      }
    });
  });
});
