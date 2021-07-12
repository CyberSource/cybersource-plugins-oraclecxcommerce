import jwtService from '@server-extension/services/jwtService';
import { cloneData, fillUndefined, verifyErrorPaths } from '../common';
import gatewaySettings from '../data/gatewaySettings';
import orderData from '../data/orderData.json';
import { sendGenerateJWTRequest } from './common';

describe.skipNotSupported('Payer Authentication enrolment JWT generation', 'card', () => {
  let payload!: OCC.OrderData;

  beforeEach(() => {
    payload = cloneData(orderData);
  });

  it('Should create enrolment jwt', async () => {
    const res = await sendGenerateJWTRequest(payload);

    expect(jwtService.decode(res.body.jwt).payload).toMatchObject({
      iss: gatewaySettings.payerAuthKeyId,
      OrgUnitId: gatewaySettings.payerAuthOrgUnitId,
      Payload: {
        orderDetails: {
          orderNumber: orderData.orderId,
          currencyCode: orderData.currencyCode,
          amount: orderData.shoppingCart.orderTotal
        },
        consumer: {
          email1: 'billing@example.com'
        }
      }
    });
  });

  it('Should fail to create enrolment jwt when not sending required address fields', async () => {
    fillUndefined(payload.shippingAddress);
    fillUndefined(payload.billingAddress);

    const expectedErrorPaths = [
      'body:billingAddress.firstName',
      'body:billingAddress.lastName',
      'body:billingAddress.country',
      'body:billingAddress.postalCode',
      'body:billingAddress.address1',
      'body:billingAddress.city',
      'body:shippingAddress.firstName',
      'body:shippingAddress.lastName',
      'body:shippingAddress.country',
      'body:shippingAddress.postalCode',
      'body:shippingAddress.address1',
      'body:shippingAddress.city'
    ];

    const res = await sendGenerateJWTRequest(payload);

    verifyErrorPaths(res.body.errors, expectedErrorPaths);
    expect(res.body).toMatchObject({
      status: 400,
      message: 'Request validation has failed. Please check your input'
    });
  });

  it('Address validation is optional', async () => {
    payload.shippingAddress = payload.billingAddress = undefined;

    await sendGenerateJWTRequest(payload).expect(200);
  });

  it('Should fail to create enrolment jwt when cart related data validations fail', async () => {
    payload.currencyCode = 'TEST';

    fillUndefined(payload.shoppingCart);

    const expectedErrorPaths = [
      'body:currencyCode',
      'body:shoppingCart.orderTotal',
      'body:shoppingCart.items[0].productId',
      'body:shoppingCart.items[0].quantity'
    ];

    const res = await sendGenerateJWTRequest(payload);

    verifyErrorPaths(res.body.errors, expectedErrorPaths);
    expect(res.body).toMatchObject({
      status: 400,
      message: 'Request validation has failed. Please check your input'
    });
  });
});
