import { PaymentContext } from '@server-extension/common';
import { CreatePaymentRequest } from 'cybersource-rest-client';
import { PaymentRequestMapper } from '../../common';

export const additionalFieldsMapper: PaymentRequestMapper = {
    supports: () => true,
    map: (context: PaymentContext): CreatePaymentRequest => {
        const { profile } = context.webhookRequest;
        return <CreatePaymentRequest>{
            buyerInformation: {
                merchantCustomerId: profile.id
            },
            deviceInformation: {
                ipAddress: context.webhookRequest.customProperties?.ipAddress,
            },
            ...context.webhookRequest.customProperties?.couponCode && {
                promotionInformation: {
                    code: context.webhookRequest.customProperties?.couponCode
                }
            }
        };
    }
};
