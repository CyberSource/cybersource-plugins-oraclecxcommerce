import { PaymentContext } from '@server-extension/common';
import { responseCodeMappings } from '@server-extension/services/payments/converters/response/common';
import {
  saleCardMapper,
  saleGenericMapper
} from '@server-extension/services/payments/converters/response/mappers';
import { PtsV2PaymentsPost201Response } from 'cybersource-rest-client';
import { mockDeep, mockReset } from 'jest-mock-extended';

describe('Converters - Response Mappers', () => {
  const context = mockDeep<PaymentContext>();

  beforeEach(() => {
    mockReset(context);
  });

  it.each`
    enabled  | status                         | supported
    ${true}  | ${'AUTHORIZED'}                | ${true}
    ${true}  | ${'PENDING_AUTHENTICATION'}    | ${false}
    ${true}  | ${'AUTHORIZED_PENDING_REVIEW'} | ${false}
    ${false} | ${'AUTHORIZED'}                | ${false}
  `(
    'should return $supported when saleEnabled is $enabled and responseStatus is $status',
    ({ enabled, status, supported }) => {
      context.isValidForPaymentMode.mockImplementation(() => enabled);
      context.data.response = {
        status: status
      };

      expect(saleCardMapper.supports(context)).toBe(supported);
    }
  );

  it.each`
    enabled  | status                         | supported
    ${true}  | ${'AUTHORIZED'}                | ${true}
    ${true}  | ${'AUTHORIZED_PENDING_REVIEW'} | ${false}
    ${false} | ${'AUTHORIZED'}                | ${false}
  `(
    'should return $supported when saleEnabled is $enabled and responseStatus is $status',
    ({ enabled, status, supported }) => {
      context.isValidForPaymentMode.mockImplementation(() => enabled);
      context.data.response = {
        status: status
      };

      expect(saleGenericMapper.supports(context)).toBe(supported);
    }
  );

  it('Should return Card Sale Enabled fields', () => {
    context.data.response = mockDeep<DeepRequired<PtsV2PaymentsPost201Response>>();
    context.data.response.orderInformation.amountDetails.authorizedAmount = '1234.123';
    context.data.response.status = 'SALE_COMPLETE';

    expect(saleCardMapper.map(context)).toMatchObject({
      authorizationResponse: {
        amount: '000001234123',
        authCode: 'SALE_COMPLETE',
        responseCode: responseCodeMappings('SALE_COMPLETE', '0110'),
        responseReason: 'SALE_COMPLETE',
        responseDescription: 'SALE_COMPLETE',
        additionalProperties: {
          sale: 'true'
        },
        customPaymentProperties: ['sale']
      }
    });
  });

  it('Should return Generic Sale Enabled fields', () => {
    context.data.response = mockDeep<DeepRequired<PtsV2PaymentsPost201Response>>();
    context.data.response.orderInformation.amountDetails.authorizedAmount = '123.4123';
    context.data.response.status = 'SALE_COMPLETE';

    expect(saleGenericMapper.map(context)).toMatchObject({
      additionalProperties: {
        sale: 'true',
        responseReason: 'SALE_COMPLETE'
      },
      response: {
        code: responseCodeMappings('SALE_COMPLETE', '0110'),
        reason: 'SALE_COMPLETE'
      }
    });
  });
});
