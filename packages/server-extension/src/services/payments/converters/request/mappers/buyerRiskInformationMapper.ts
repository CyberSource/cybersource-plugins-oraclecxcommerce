import { PaymentContext } from '@server-extension/common';
import { CreatePaymentRequest } from 'cybersource-rest-client';
import { PaymentRequestMapper } from '../../common';

export const buyerRiskInformationMapper: PaymentRequestMapper = {
    supports: (context: PaymentContext) => !context.isValidForPaymentMode('dmDecisionSkip'),
    map: (context: PaymentContext) => {
        const { customProperties, profileDetails } = context.webhookRequest;
        return <CreatePaymentRequest>{
            riskInformation: {
                buyerHistory: {
                    customerAccount: {
                        ...profileDetails?.id ? {
                            creationHistory: customProperties?.numberOfPurchases && parseInt(customProperties.numberOfPurchases) > 0 ? 'EXISTING_ACCOUNT' : 'NEW_ACCOUNT',
                            createDate: profileDetails?.registrationDate
                        } : { creationHistory: 'GUEST' },

                    },
                    ...customProperties?.numberOfPurchases && { accountPurchases: customProperties?.numberOfPurchases }
                }
            }
        };
    }
};

