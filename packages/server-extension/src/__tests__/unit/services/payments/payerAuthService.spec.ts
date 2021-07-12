import jwtService from '@server-extension/services/payments/payerAuthService';
import { mockDeep, mockReset } from 'jest-mock-extended';
import * as jwtSimple from 'jwt-simple';
import orderData from '../../data/orderData.json';

describe('Payer Authentication Service', () => {
  const gatewaySettings = mockDeep<OCC.GatewaySettings>();
  const payerAuthKeyId = 'payerAuthKeyId';
  const payerAuthKey = 'payerAuthKey';
  const payerAuthOrgUnitId = 'payerAuthOrgUnitId';

  beforeEach(() => {
    mockReset(gatewaySettings);
    gatewaySettings.payerAuthKeyId = payerAuthKeyId;
    gatewaySettings.payerAuthKey = payerAuthKey;
    gatewaySettings.payerAuthOrgUnitId = payerAuthOrgUnitId;
  });

  it('Should create valid JWT using provided order data', () => {
    const jwt = jwtService(gatewaySettings, orderData);

    expect(jwtSimple.decode(jwt, payerAuthKey)).toMatchObject({
      iss: payerAuthKeyId,
      OrgUnitId: payerAuthOrgUnitId,
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

  it('Should create JWT using email shipping address email when no billing address email', () => {
    orderData.billingAddress.email = undefined!;
    const jwt = jwtService(gatewaySettings, orderData);
    expect(jwtSimple.decode(jwt, payerAuthKey)).toMatchObject({
      iss: payerAuthKeyId,
      OrgUnitId: payerAuthOrgUnitId,
      Payload: {
        orderDetails: {
          orderNumber: orderData.orderId,
          currencyCode: orderData.currencyCode,
          amount: orderData.shoppingCart.orderTotal
        },
        consumer: {
          email1: 'shipping@example.com'
        }
      }
    });
  });
});
