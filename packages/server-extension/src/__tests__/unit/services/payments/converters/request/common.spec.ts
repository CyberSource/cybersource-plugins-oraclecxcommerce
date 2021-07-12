import { PaymentContext } from '@server-extension/common';
import {
  cardTypeMappings,
  twoDecimal
} from '@server-extension/services/payments/converters/request/common';
import { mockDeep, mockReset } from 'jest-mock-extended';

describe('Converters - Requests', () => {
  const context = mockDeep<PaymentContext>();

  beforeEach(() => {
    mockReset(context);
  });

  it('Should return twoDecimal from string amount', () => {
    const amount = '000000122526';

    expect(twoDecimal(amount)).toBe('1225.26');
  });

  it.each`
    type      | mappedType
    ${'visa'} | ${'001'}
    ${'VISA'} | ${'001'}
  `('should map card types', ({ type, mappedType }) => {
    expect(cardTypeMappings(type)).toBe(mappedType);
  });
});
