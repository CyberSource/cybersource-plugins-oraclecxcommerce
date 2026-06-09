import { PaymentContext, RequestContext } from '@server-extension/common';
import { Request } from 'express';

function toArray(options: string) {
  return options
    .toLowerCase()
    .split(',')
    .map((payment) => payment.trim());
}

export default function buildPaymentContext(req: Request, res: any): PaymentContext {
  const requestContext = <RequestContext>res.locals.requestContext;
  const webhookRequest = <OCC.GenericPaymentWebhookRequest>req.body;
  const paymentMode = webhookRequest.customProperties?.paymentType ?? webhookRequest.paymentMethod;

  const getSetting = (key: string) => requestContext.gatewaySettings && requestContext.gatewaySettings[key];
  const getOptions = (key: string) => {
    const setting = getSetting(key);
    return setting ? toArray(<string>setting) : [];
  };
  const isValidForPaymentMode = (key: string) => getOptions(key).includes(paymentMode);
  const hasOption = (key: string, option: string) => getOptions(key).includes(option);
  //res.locals.data = res.locals.data || {};

  return {
    requestContext,
    paymentMode,
    webhookRequest,
    webhookResponse: undefined,
    data: res.locals.data,
    getSetting,
    getOptions,
    hasOption,
    isValidForPaymentMode
  };
}
