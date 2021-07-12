import { PaymentContext } from '@server-extension/common';
import { transientTokenInfoMapper } from '@server-extension/services/payments/converters/request/mappers';
import { mockDeep, mockReset } from 'jest-mock-extended';

describe('Converters - Request Mappers', () => {
  const context = mockDeep<PaymentContext>();

  beforeEach(() => {
    mockReset(context);
  });

  it.each`
    transientToken         | instrumentIdentifier      | supported
    ${'transientTokenJwt'} | ${''}                     | ${true}
    ${undefined}           | ${''}                     | ${false}
    ${undefined}           | ${'instrumentIdentifier'} | ${false}
    ${'transientTokenJwt'} | ${'instrumentIdentifier'} | ${false}
  `(
    "should return $supported when tokens are ['$transientToken', '$instrumentIdentifier']",
    ({ transientToken, instrumentIdentifier, supported }) => {
      context.webhookRequest.customProperties = { transientTokenJwt: transientToken };
      context.webhookRequest.cardDetails.token = instrumentIdentifier;

      expect(transientTokenInfoMapper.supports(context)).toBe(supported);
    }
  );

  it('Should return Transient Token Info Fields', () => {
    const mappedRequest = transientTokenInfoMapper.map(context);

    expect(mappedRequest).toMatchObject({
      tokenInformation: {
        transientTokenJwt: context.webhookRequest.customProperties?.transientTokenJwt
      }
    });
  });
});
