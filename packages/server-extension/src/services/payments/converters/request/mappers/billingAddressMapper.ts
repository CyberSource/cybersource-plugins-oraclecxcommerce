import { PaymentContext } from '@server-extension/common';
import { CreatePaymentRequest } from 'cybersource-rest-client';
import { PaymentRequestMapper } from '../../common';

export const billingAddressMapper: PaymentRequestMapper = {
  supports: () => true,

  map: (context: PaymentContext): CreatePaymentRequest => {
    const { billingAddress, profileDetails } = context.webhookRequest;

    return <CreatePaymentRequest>{
      orderInformation: {
        billTo: {
          firstName: billingAddress.firstName,
          lastName: billingAddress.lastName,
          country: billingAddress.country,
          postalCode: billingAddress.postalCode,
          locality: billingAddress.city,
          phoneNumber: billingAddress.phoneNumber,
          address1: billingAddress.address1,
          address2: billingAddress.address2,
          email: billingAddress.email ?? profileDetails?.email,
          administrativeArea: billingAddress.state 
        }
      }
    };
  }
};
