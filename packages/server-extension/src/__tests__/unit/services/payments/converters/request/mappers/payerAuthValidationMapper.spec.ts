import { PaymentContext } from '@server-extension/common';
import jwtService from '@server-extension/services/jwtService';
import { payerAuthValidationMapper } from '@server-extension/services/payments/converters/request/mappers';
import { mockDeep, mockReset } from 'jest-mock-extended';
import { mocked } from 'ts-jest/utils';

jest.mock('@server-extension/services/jwtService');

describe('Converters - Request Mappers', () => {
  const context = mockDeep<PaymentContext>();

  beforeEach(() => {
    mockReset(context);
  });

  it.each`
    authJwt      | supported
    ${'authJwt'} | ${true}
    ${undefined} | ${false}
  `("should return $supported when authJwt is '$authJwt'", ({ authJwt, supported }) => {
    context.webhookRequest.customProperties = {
      authJwt: authJwt
    };

    expect(payerAuthValidationMapper.supports(context)).toBe(supported);
  });

  it('Should return Payer Auth Validation Fields', () => {
    mocked(jwtService.decode).mockReturnValue({
      header: {},
      payload: { Payload: { Payment: { ProcessorTransactionId: 'transactionId' } } }
    });
    const mappedRequest = payerAuthValidationMapper.map(context);

    expect(mappedRequest).toMatchObject({
      processingInformation: {
        actionList: ['VALIDATE_CONSUMER_AUTHENTICATION']
      },
      consumerAuthenticationInformation: {
        authenticationTransactionId: 'transactionId'
      }
    });
  });
});
