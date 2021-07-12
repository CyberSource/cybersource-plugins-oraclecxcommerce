import { PaymentContext } from '@server-extension/common';
import {
  mapInstrumentIdentifier,
  savedCardPaymentMapper
} from '@server-extension/services/payments/converters/response/mappers';
import { PtsV2PaymentsPost201Response } from 'cybersource-rest-client';
import { mockDeep, mockReset } from 'jest-mock-extended';

describe('Converters - Response Mappers', () => {
  const context = mockDeep<PaymentContext>();

  beforeEach(() => {
    mockReset(context);
  });

  it.each`
    token                       | supported
    ${'instrumentIdentifierId'} | ${true}
    ${undefined}                | ${false}
  `('should return $supported when payment token is $token', ({ token, supported }) => {
    context.data.response = {
      tokenInformation: {
        instrumentIdentifier: {
          id: token
        }
      }
    };

    expect(savedCardPaymentMapper.supports(context)).toBe(supported);
  });

  it('Should return Instrument identifier id', () => {
    context.data.response = mockDeep<DeepRequired<PtsV2PaymentsPost201Response>>();

    expect(savedCardPaymentMapper.map(context)).toMatchObject({
      authorizationResponse: {
        token: mapInstrumentIdentifier(context.data.response)
      }
    });
  });
});
