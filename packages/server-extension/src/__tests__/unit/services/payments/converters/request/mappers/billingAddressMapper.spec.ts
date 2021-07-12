import { PaymentContext } from '@server-extension/common';
import { billingAddressMapper } from '@server-extension/services/payments/converters/request/mappers';
import { mockDeep, mockReset } from 'jest-mock-extended';

describe('Converters - Request Mappers', () => {
  const context = mockDeep<PaymentContext>();

  beforeEach(() => {
    mockReset(context);
  });

  it('Should map billing address fields', () => {
    const { billingAddress } = context.webhookRequest;

    expect(billingAddressMapper.map(context)).toMatchObject({
      orderInformation: {
        billTo: {
          firstName: billingAddress.firstName,
          lastName: billingAddress.lastName,
          country: billingAddress.country,
          postalCode: billingAddress.postalCode,
          locality: billingAddress.city,
          phoneNumber: billingAddress.phoneNumber,
          address1: billingAddress.address1,
          address2: billingAddress.address2,
          email: billingAddress.email,
          administrativeArea: billingAddress.state
        }
      }
    });
  });
});
