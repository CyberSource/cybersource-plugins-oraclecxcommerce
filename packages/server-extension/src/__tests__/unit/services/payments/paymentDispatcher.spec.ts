import { middleware, Next, PaymentContext } from '@server-extension/common';
import PaymentDispatcher from '@server-extension/services/payments/paymentDispatcher';
import { Request } from 'express';
import { mockDeep } from 'jest-mock-extended';

jest.mock('@server-extension/services/loggingService');

describe('Services - Payment Dispatcher', () => {
  const request = mockDeep<Request>();
  request.app.locals = {};

  const webhookRequest: any = (request.body = {
    customProperties: {}
  });

  // A handler which passes control to next available handler in the chain
  const handler1 = (_context: PaymentContext, next: Next) => next();

  // A handler writes webhookResponse to context - finishes execution chain as there is no more handlers available
  const handler2 = middleware((context: PaymentContext) => {
    context.webhookResponse = {
      orderId: '1'
    } as OCC.GenericPaymentWebhookResponse;
  });

  // A handler writes webhookResponse to context - finishes execution chain as there is no more handlers available
  const handler3 = middleware((context: PaymentContext) => {
    context.webhookResponse = {
      orderId: '2'
    } as OCC.GenericPaymentWebhookResponse;
  });

  it('should dispatch to payment middleware according to currently submitted payment type', async () => {
    const dispatcher = new PaymentDispatcher();

    dispatcher.use('card_auth', handler1, handler2);
    dispatcher.use('generic_googlepay_auth', handler1, handler3);

    // Should call 'card_auth' execution chain
    webhookRequest.paymentMethod = 'card';
    webhookRequest.transactionType = 'auth';
    webhookRequest.customProperties.paymentType = '';
    expect(await dispatcher.dispatchFrom(request)).toMatchObject({
      orderId: '1'
    });

    // Should call 'generic_googlepay_auth' execution chain
    webhookRequest.paymentMethod = 'generic';
    webhookRequest.transactionType = 'auth';
    webhookRequest.customProperties.paymentType = 'googlepay';
    expect(await dispatcher.dispatchFrom(request)).toMatchObject({
      orderId: '2'
    });
  });

  it('should handle error with custom handler', async () => {
    const dispatcher = new PaymentDispatcher();

    const errorTriggeringHandler = (_context: PaymentContext, _next: Next) => {
      throw new Error('error');
    };

    const errorHandler = (err: any, context: PaymentContext) => {
      context.webhookResponse = <OCC.GenericPaymentWebhookResponse>{
        authorizationResponse: {
          responseReason: err.message
        }
      };
    };

    dispatcher.use('card_auth', handler1, errorTriggeringHandler).catch(errorHandler);

    // Should call 'card_auth' execution chain
    webhookRequest.paymentMethod = 'card';
    webhookRequest.transactionType = 'auth';
    webhookRequest.customProperties.paymentType = '';
    const res = await dispatcher.dispatchFrom(request);

    expect(res).toMatchObject({
      authorizationResponse: {
        responseReason: 'error'
      }
    });
  });
});
