import { Request } from 'express';
import mapCardDetails from './cardDetailsMapper';

const AUTH_TRANSACTION_TYPE = '0100';

function lpadNumber(num: number) {
  return (num * 100).toString().padStart(12, '0');
}

const mapAddress = (address: any) => {
  return {
    lastName: address.lastName,
    postalCode: address.postalCode,
    phoneNumber: address.phoneNumber,
    email: address.email,
    state: address.selectedState,
    address1: address.address1,
    address2: address.address2,
    firstName: address.firstName,
    city: address.city,
    country: address.selectedCountry
  };
};

const profile = {
  id: '110454',
  phoneNumber: '617-555-1977',
  email: 'tshopper@example.com'
};

const profileDetails = {
  id: '110454',
  lastName: 'Shopper',
  firstName: 'Test',
  taxExempt: false,
  profileType: 'b2c_user',
  receiveEmail: 'no',
  registrationDate: '2019-10-15T06:50:51.000Z',
  lastPasswordUpdate: '2019-10-15T06:50:51.000Z'
};

const orderToWebhook = (req: Request) => {
  const orderPayload = req.body;
  const { shippingAddress, billingAddress, shoppingCart, payments } = orderPayload;
  const defaultPayment = payments[0];
  const isCardPayment = defaultPayment.type === 'card';

  return {
    orderId: orderPayload.id,
    siteId: 'siteUS',
    locale: 'en',
    siteURL: 'https://www.example.com',
    channel: req.headers.channel,
    transactionId: 'o30446-pg30417-1458555741310',
    transactionType: AUTH_TRANSACTION_TYPE,
    transactionTimestamp: new Date().toISOString(),
    currencyCode: 'USD',
    paymentId: 'pg30417',
    paymentMethod: defaultPayment.type,
    gatewayId: 'isv-occ-gateway',
    gatewaySettings: {
      paymentMethodTypes: ['card', 'generic'],
      filteredFields: ['paymentMethodTypes']
    },
    amount: lpadNumber(shoppingCart.orderTotal),
    cardDetails: {
      ...(isCardPayment && mapCardDetails(defaultPayment))
    },
    customProperties: defaultPayment.customProperties,
    billingAddress: {
      ...mapAddress(billingAddress)
    },
    shippingAddress: {
      ...mapAddress(shippingAddress)
    },
    profile: {
      ...profile
    },
    profileDetails: {
      ...profileDetails
    }
  };
};

export default orderToWebhook;
