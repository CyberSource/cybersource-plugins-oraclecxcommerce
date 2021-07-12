import { middleware, PaymentContext } from '@server-extension/common';
import { CreatePaymentRequest } from 'cybersource-rest-client';
import { convertRequest, twoDecimal } from './common';
import {
  billingAddressMapper,
  decisionManagerMapper,
  deviceFingerprintMapper,
  saleMapper
} from './mappers';

function createApplepayAuthorizationRequest(context: PaymentContext) {
  const { webhookRequest } = context;

  const paymentRequest: CreatePaymentRequest = {
    clientReferenceInformation: {
      code: webhookRequest.orderId
    },
    processingInformation: {
      commerceIndicator: 'internet',
      paymentSolution: '001'
    },
    orderInformation: {
      amountDetails: {
        totalAmount: twoDecimal(webhookRequest.amount),
        currency: webhookRequest.currencyCode
      }
    },
    paymentInformation: {
      fluidData: {
        value: Buffer.from(webhookRequest.customProperties?.paymentToken as string).toString(
          'base64'
        )
      }
    }
  };

  context.data.request = convertRequest<CreatePaymentRequest>(
    context,
    paymentRequest,
    deviceFingerprintMapper,
    decisionManagerMapper,
    billingAddressMapper,
    saleMapper
  );
}

export default middleware(createApplepayAuthorizationRequest);
