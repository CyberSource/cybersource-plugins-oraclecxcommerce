import { PaymentContext } from '@server-extension/common';
import { CreatePaymentRequest } from 'cybersource-rest-client';
import { PaymentRequestMapper } from '../../common';

export const shippingAddressMapper: PaymentRequestMapper = {
  supports: () => true,

  map: (context: PaymentContext): CreatePaymentRequest => {
    let { shippingAddress } = context.webhookRequest;

    shippingAddress = Array.isArray(shippingAddress)?shippingAddress.length?shippingAddress[0]:{}:shippingAddress;

    return <CreatePaymentRequest>{
      orderInformation: {
        shipTo: {
          firstName: shippingAddress.firstName,
          lastName: shippingAddress.lastName,
          country: shippingAddress.country,
          postalCode: shippingAddress.postalCode,
          locality: shippingAddress.city,
          phoneNumber: shippingAddress.phoneNumber,
          address1: shippingAddress.address1,
          address2: shippingAddress.address2,
          administrativeArea: shippingAddress.state
        }
      }
    };
  }
};
