import { PaymentContext } from '@server-extension/common';
import { cardTypeMappings } from '@server-extension/services/payments/converters/request/common';
import { savedCardPaymentMapper } from '@server-extension/services/payments/converters/request/mappers';
import { mockDeep, mockReset } from 'jest-mock-extended';

describe('Converters - Request Mappers', () => {
  const context = mockDeep<PaymentContext>();

  beforeEach(() => {
    mockReset(context);
  });

  it.each`
    token                     | supported
    ${'instrumentIdentifier'} | ${true}
    ${''}                     | ${false}
  `("should return $supported when payment token is '$token'", ({ token, supported }) => {
    context.webhookRequest.cardDetails.token = token;

    expect(savedCardPaymentMapper.supports(context)).toBe(supported);
  });

  it('Should return Plain Card Details Fields', () => {
    const mappedRequest = savedCardPaymentMapper.map(context);

    const cardDetails = context.webhookRequest.cardDetails;

    expect(mappedRequest).toMatchObject({
      paymentInformation: {
        instrumentIdentifier: {
          id: cardDetails.token
        },
        card: {
          expirationYear: cardDetails.expirationYear,
          expirationMonth: cardDetails.expirationMonth,
          type: cardTypeMappings(cardDetails.type)
        }
      }
    });
  });
});
