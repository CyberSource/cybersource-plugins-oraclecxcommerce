import { PaymentContext } from '@server-extension/common';
import { savePaymentTokenMapper } from '@server-extension/services/payments/converters/request/mappers';
import { mockDeep, mockReset } from 'jest-mock-extended';

describe('Converters - Request Mappers', () => {
  const context = mockDeep<PaymentContext>();

  beforeEach(() => {
    mockReset(context);
  });

  it.each`
    saveCard | supported
    ${true}  | ${true}
    ${false} | ${false}
  `('should return $supported when saveCard is $saveCard', ({ saveCard, supported }) => {
    context.webhookRequest.cardDetails.saveCard = saveCard;

    expect(savePaymentTokenMapper.supports(context)).toBe(supported);
  });

  it('Should return Plain Card Details Fields', () => {
    const mappedRequest = savePaymentTokenMapper.map(context);

    expect(mappedRequest).toMatchObject({
      processingInformation: {
        actionList: ['TOKEN_CREATE'],
        actionTokenTypes: ['customer', 'paymentInstrument', 'shippingAddress']
      }
    });
  });
});
