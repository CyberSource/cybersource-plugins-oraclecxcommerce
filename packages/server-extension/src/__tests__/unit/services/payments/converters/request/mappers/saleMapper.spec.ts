import { PaymentContext } from '@server-extension/common';
import { saleMapper } from '@server-extension/services/payments/converters/request/mappers';
import { mockDeep, mockReset } from 'jest-mock-extended';

describe('Converters - Request Mappers', () => {
  const context = mockDeep<PaymentContext>();

  beforeEach(() => {
    mockReset(context);
  });

  it.each`
    isValidForPaymentMode | supported
    ${true}               | ${true}
    ${false}              | ${false}
  `(
    'should return $supported when saleEnabled is $isValidForPaymentMode, payerAuthEnabled is $payerAuth and authJwt is $token',
    ({ isValidForPaymentMode, supported }) => {
      context.isValidForPaymentMode.mockImplementation(() => isValidForPaymentMode);

      expect(saleMapper.supports(context)).toBe(supported);
    }
  );

  it('Should return Card Sale Enabled fields', () => {
    expect(saleMapper.map(context)).toMatchObject({
      processingInformation: {
        capture: true
      }
    });
  });
});
