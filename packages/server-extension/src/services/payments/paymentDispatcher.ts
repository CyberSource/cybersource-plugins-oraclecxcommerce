import { GenericDispatcher, Middleware, PaymentContext } from '@server-extension/common';
import { Request } from 'express';
import buildPaymentContext from './paymentContextBuilder';

export type PaymentHandler = Middleware<PaymentContext>;
export type PaymentHandlers = PaymentHandler[];

class PaymentDispatcher {
  router: Record<string, GenericDispatcher<PaymentContext>>;

  constructor() {
    this.router = {};
  }

  use(paymentOperation: string, ...handlers: PaymentHandlers): GenericDispatcher<PaymentContext> {
    const dispatcher = this.router[paymentOperation] ?? new GenericDispatcher<PaymentContext>();

    dispatcher.use(...handlers);

    this.router[paymentOperation] = dispatcher;

    return dispatcher;
  }

  async dispatchFrom(req: Request): Promise<OCC.GenericPaymentWebhookResponse> {
    const paymentContext = buildPaymentContext(req);
    await this.dispatch(paymentContext);
    return paymentContext.webhookResponse as OCC.GenericPaymentWebhookResponse;
  }

  dispatch(context: PaymentContext): Promise<void> {
    const { paymentMethod, transactionType, customProperties } = context.webhookRequest;
    const paymentType = customProperties?.paymentType;

    const operation = [paymentMethod, paymentType, transactionType].filter((el) => el).join('_');

    const dispatcher = this.router[operation] ?? this.router[`*_${transactionType}`];

    return dispatcher.dispatch(context);
  }
}

export default PaymentDispatcher;
