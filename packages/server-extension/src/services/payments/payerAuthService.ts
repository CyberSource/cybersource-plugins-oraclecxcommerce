import { Guid } from 'guid-typescript';
import * as jwtSimple from 'jwt-simple';

const newGuid = () => Guid.create().toString();

function mapJwtPayloadAddress(address: OCC.OrderDataShippingAddress | OCC.OrderDataBillingAddress) {
  return <OCC.OrderDataBillingAddress>{
    lastName: address.lastName,
    postalCode: address.postalCode,
    phoneNumber: address.phoneNumber,
    email: address.email,
    state: address.state,
    address1: address.address1,
    address2: address.address2,
    firstName: address.firstName,
    city: address.city,
    country: address.country
  };
}

function mapOrderNumber(orderData: OCC.OrderData) {
  return {
    orderNumber: orderData.orderId ?? newGuid()
  };
}

function buildJwtPayload(orderData: OCC.OrderData) {
  const { billingAddress, shippingAddress } = orderData;

  return <OCC.JwtPayload>{
    orderDetails: {
      currencyCode: orderData.currencyCode,
      amount: orderData.shoppingCart.orderTotal,
      ...mapOrderNumber(orderData)
    },
    consumer: {
      billingAddress: {
        ...(billingAddress && mapJwtPayloadAddress(billingAddress))
      },
      shippingAddress: {
        ...(shippingAddress && mapJwtPayloadAddress(shippingAddress))
      },
      email1: billingAddress?.email ?? shippingAddress?.email
    }
  };
}

function buildPayload(orderData: OCC.OrderData, keyId: string, orgUnitId: string) {
  return {
    jti: newGuid(),
    iat: Date.now() / 1000,
    iss: keyId,
    OrgUnitId: orgUnitId,
    Payload: buildJwtPayload(orderData)
  };
}

export default function generateToken(settings: OCC.GatewaySettings, orderData: OCC.OrderData) {
  const { payerAuthKeyId, payerAuthOrgUnitId, payerAuthKey } = settings;

  return jwtSimple.encode(
    buildPayload(orderData, payerAuthKeyId, payerAuthOrgUnitId),
    payerAuthKey
  );
}
