import { PaymentContext } from '@server-extension/common';
import { CreatePaymentRequest } from 'cybersource-rest-client';
import { PaymentRequestMapper } from '../../common';

export const decisionManagerMapper: PaymentRequestMapper = {
  supports: (context: PaymentContext) => context.isValidForPaymentMode('dmDecisionSkip'),

  map: () => {
    return <CreatePaymentRequest>{
      processingInformation: {
        actionList: ['DECISION_SKIP']
      }
    };
  }
};
