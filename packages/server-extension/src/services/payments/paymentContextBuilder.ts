import { PaymentContext, RequestContext } from '@server-extension/common';
import { Request } from 'express';

function toArray(options: string) {
  return options
    .toLowerCase()
    .split(',')
    .map((payment) => payment.trim());
}

export default function buildPaymentContext(req: Request): PaymentContext {
  const requestContext = <RequestContext>req.app.locals;
  const webhookRequest = <OCC.GenericPaymentWebhookRequest>req.body;
  const paymentMode = webhookRequest.customProperties?.paymentType ?? webhookRequest.paymentMethod;

  const getSetting = (key: string) => requestContext.gatewaySettings[key];
  const getOptions = (key: string) => toArray(<string>getSetting(key));
  const isValidForPaymentMode = (key: string) => getOptions(key).includes(paymentMode);
  const hasOption = (key: string, option: string) => getOptions(key).includes(option);
  req.app.locals.data = req.app.locals.data || {};

  return {
    requestContext,
    paymentMode,
    webhookRequest,
    webhookResponse: undefined,
    data: req.app.locals.data,
    getSetting,
    getOptions,
    hasOption,
    isValidForPaymentMode
  };
}
