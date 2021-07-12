import { pspResponseTypeMappings } from '@server-extension/services/payments/converters/response/common';
import request from 'supertest';
import gatewaySettings from '../int/data/gatewaySettings';
import app from './test.app';

export const sendPaymentRequest = (
  webhookRequest: DeepPartial<OCC.GenericPaymentWebhookRequest>
) => {
  return request(app)
    .post('/ccstorex/custom/isv-payment/v1/payments')
    .send(webhookRequest)
    .set('Accept', 'application/json')
    .set('channel', 'storefront');
};

export const sendPaymentCaptureRequest = (payload: OCC.CapturePaymentRequest) => {
  return request(app)
    .post('/ccstorex/custom/isv-payment/v1/capture')
    .send(payload)
    .set('Accept', 'application/json')
    .set('channel', 'storefront');
};

export const sendCreateCaptureContextRequest = (payload: OCC.CaptureContextRequest) => {
  return request(app)
    .post('/ccstorex/custom/isv-payment/v1/keys')
    .send(payload)
    .set('Accept', 'application/json')
    .set('channel', 'storefront');
};

export const sendPaymentMethodsRequest = () => {
  return request(app)
    .get('/ccstorex/custom/isv-payment/v1/paymentMethods')
    .set('Accept', 'application/json')
    .set('channel', 'storefront');
};

export const sendValidateRequest = (body: any) => {
  return request(app)
    .post('/ccstorex/custom/isv-payment/v1/applepay/validate')
    .send(body)
    .set('Accept', 'application/json')
    .set('channel', 'storefront');
};

export const sendPaymentRefundRequest = (payload: OCC.RefundPaymentRequest) => {
  return request(app)
    .post('/ccstorex/custom/isv-payment/v1/refund')
    .send(payload)
    .set('Accept', 'application/json')
    .set('channel', 'storefront');
};

export const sendDailyReportRequest = (date?: Date | string) => {
  let dateParam = date ?? '';

  if (date instanceof Date) {
    dateParam = date.toISOString().split('T')[0];
  }

  return request(app)
    .get(`/ccstorex/custom/isv-payment/v1/report/daily?date=${dateParam}`)
    .set('Accept', 'application/json')
    .set('channel', 'storefront');
};

export const sendOnDemandReportRequest = (startDate?: string, endDate?: string) => {
  const startTime = startDate ? `startTime=${startDate}` : '';
  const endTime = endDate ? `endTime=${endDate}` : '';
  const queryParams = startDate ? `${startTime}&${endTime}` : `${endTime}`;
  return request(app)
    .get(`/ccstorex/custom/isv-payment/v1/report/onDemand?${queryParams}`)
    .set('Accept', 'application/json')
    .set('channel', 'storefront');
};

export const verifyCardResponse = (
  request: OCC.GenericPaymentWebhookRequest,
  response: Record<string, unknown>[]
): void => {
  expect(response).toMatchObject({
    orderId: request.orderId,
    channel: request.channel,
    locale: request.locale,
    transactionType: request.transactionType,
    currencyCode: request.currencyCode,

    [pspResponseTypeMappings[request.transactionType]]: {
      transactionTimestamp: request.transactionTimestamp,
      paymentId: request.paymentId,
      transactionId: request.transactionId,
      paymentMethod: request.paymentMethod,
      gatewayId: request.gatewayId,
      siteId: request.siteId,
      merchantTransactionId: request.transactionId
    }
  });
};

export const verifyResponse = (
  request: OCC.GenericPaymentWebhookRequest,
  response: Record<string, unknown>[]
): void => {
  expect(response).toMatchObject({
    orderId: request.orderId,
    channel: request.channel,
    locale: request.locale,
    transactionType: request.transactionType,
    currencyCode: request.currencyCode,
    amount: request.amount,
    paymentId: request.paymentId
  });
};

export const verifyErrorPaths = (errors: any[], expectedErrorPaths: string[]) => {
  const actualErrorPaths = errors.map((error) => error['o:errorPath']);
  expect(actualErrorPaths).toHaveLength(expectedErrorPaths.length);
  for (const path of expectedErrorPaths) {
    expect(actualErrorPaths).toContainEqual(path);
  }
};

export const cloneData = (obj: any) => JSON.parse(JSON.stringify(obj));

export const fillUndefined = (obj: any) => {
  Object.keys(obj).forEach((key) =>
    typeof obj[key] === 'object' ? fillUndefined(obj[key]) : (obj[key] = undefined)
  );
};

export const itif = (condition: boolean) => (condition ? it : it.skip);

describe.skipNotSupported = (name: string, paymentOption: string, fn: jest.EmptyFunction) =>
  isSupportedPaymentOption(paymentOption) ? describe(name, fn) : describe.skip(name, fn); //eslint-disable-line jest/valid-describe

const availablePaymentOptions: string[] = gatewaySettings.paymentOptions
  .split(',')
  .map((option: string) => option.trim());

const isSupportedPaymentOption = (paymentOption: string) =>
  availablePaymentOptions.includes(paymentOption);
