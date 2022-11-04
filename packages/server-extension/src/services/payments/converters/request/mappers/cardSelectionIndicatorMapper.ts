import { PaymentContext } from '@server-extension/common';
import { CreatePaymentRequest } from 'cybersource-rest-client';
import { PaymentRequestMapper } from '../../common';

const CARD_TYPE_SELECTION_INDICATOR = '1';

export const cardSelectionIndicatorMapper: PaymentRequestMapper = {
  supports: (context: PaymentContext) => {
    return Boolean(context.webhookRequest.cardDetails?.type);
  },

  map: () => {
    return <CreatePaymentRequest>{
      paymentInformation: {
        card: {
          typeSelectionIndicator: CARD_TYPE_SELECTION_INDICATOR
        }
      }
    };
  }
};
