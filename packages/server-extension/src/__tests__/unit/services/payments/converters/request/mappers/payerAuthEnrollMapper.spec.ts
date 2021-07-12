import { PaymentContext } from '@server-extension/common';
import { payerAuthEnrollMapper } from '@server-extension/services/payments/converters/request/mappers';
import { mockDeep, mockReset } from 'jest-mock-extended';

describe('Converters - Request Mappers', () => {
  const context = mockDeep<PaymentContext>();

  beforeEach(() => {
    mockReset(context);
  });

  it.each`
    payerAuthEnabled | authJwt      | supported
    ${true}          | ${undefined} | ${true}
    ${true}          | ${'authJwt'} | ${false}
    ${false}         | ${'authJwt'} | ${false}
    ${false}         | ${undefined} | ${false}
  `(
    'should return $supported when payerAuthEnabled is $payerAuthEnabled and authJwt is $authJwt',
    ({ payerAuthEnabled, authJwt, supported }) => {
      context.requestContext.gatewaySettings.payerAuthEnabled = payerAuthEnabled;
      context.webhookRequest.customProperties = {
        authJwt: authJwt
      };

      expect(payerAuthEnrollMapper.supports(context)).toBe(supported);
    }
  );

  it('Should return Payer Auth Enrollment Fields', () => {
    const mappedRequest = payerAuthEnrollMapper.map(context);

    expect(mappedRequest).toMatchObject({
      processingInformation: {
        actionList: ['CONSUMER_AUTHENTICATION']
      },
      consumerAuthenticationInformation: {
        requestorId: 'requestorId',
        referenceId: context.webhookRequest.customProperties?.referenceId
      }
    });
  });
});
