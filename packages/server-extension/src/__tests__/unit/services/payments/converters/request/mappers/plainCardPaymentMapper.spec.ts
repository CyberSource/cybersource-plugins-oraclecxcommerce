import { PaymentContext } from '@server-extension/common';
import { cardTypeMappings } from '@server-extension/services/payments/converters/request/common';
import { plainCardPaymentMapper } from '@server-extension/services/payments/converters/request/mappers';
import { mockDeep, mockReset } from 'jest-mock-extended';

describe('Converters - Request Mappers', () => {
  const context = mockDeep<PaymentContext>();

  beforeEach(() => {
    mockReset(context);
  });

  it.each`
    transientToken         | instrumentIdentifier      | supported
    ${undefined}           | ${''}                     | ${true}
    ${'transientTokenJwt'} | ${''}                     | ${false}
    ${undefined}           | ${'instrumentIdentifier'} | ${false}
    ${'transientTokenJwt'} | ${'instrumentIdentifier'} | ${false}
  `(
    "should return $supported when tokens are ['$transientToken', '$instrumentIdentifier']",
    ({ transientToken, instrumentIdentifier, supported }) => {
      context.webhookRequest.customProperties = { transientTokenJwt: transientToken };
      context.webhookRequest.cardDetails.token = instrumentIdentifier;

      expect(plainCardPaymentMapper.supports(context)).toBe(supported);
    }
  );

  it('Should return Plain Card Details Fields', () => {
    const mappedRequest = plainCardPaymentMapper.map(context);

    const cardDetails = context.webhookRequest.cardDetails;

    expect(mappedRequest).toMatchObject({
      paymentInformation: {
        card: {
          expirationYear: cardDetails.expirationYear,
          expirationMonth: cardDetails.expirationMonth,
          number: cardDetails.number,
          securityCode: cardDetails.cvv,
          type: cardTypeMappings(cardDetails.type)
        }
      }
    });
  });
});
