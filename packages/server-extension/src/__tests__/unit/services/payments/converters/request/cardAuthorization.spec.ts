import { PaymentContext } from '@server-extension/common';
import { createAuthorizationRequest } from '@server-extension/services/payments/converters/request/cardAuthorization';
import { twoDecimal } from '@server-extension/services/payments/converters/request/common';
import { mockDeep } from 'jest-mock-extended';

jest.mock('@server-extension/services/payments/converters/request/mappers');

describe('Converters - Request Mappers', () => {
  const context = mockDeep<PaymentContext>();
  const request = mockDeep<OCC.GenericPaymentWebhookRequest>();

  it('Should convert authorization base fields', () => {
    context.webhookRequest = request;

    createAuthorizationRequest(context);

    expect(context.data.request).toMatchObject({
      clientReferenceInformation: {
        code: request.orderId
      },
      orderInformation: {
        amountDetails: {
          totalAmount: twoDecimal(request.amount),
          currency: request.currencyCode
        }
      }
    });
  });
});
