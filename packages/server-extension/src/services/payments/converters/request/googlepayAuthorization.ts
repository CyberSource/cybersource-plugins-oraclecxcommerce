import { middleware, PaymentContext } from '@server-extension/common';
import { CreatePaymentRequest } from 'cybersource-rest-client';
import { convertRequest, twoDecimal } from './common';
import {
  billingAddressMapper,
  decisionManagerMapper,
  deviceFingerprintMapper,
  saleMapper
} from './mappers';

function createGooglepayAuthorizationRequest(context: PaymentContext) {
  const { webhookRequest } = context;

  const paymentRequest: CreatePaymentRequest = {
    clientReferenceInformation: {
      code: webhookRequest.orderId
    },
    processingInformation: {
      commerceIndicator: 'internet',
      paymentSolution: '012'
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

  context.data.request = <CreatePaymentRequest>(
    convertRequest(
      context,
      paymentRequest,
      deviceFingerprintMapper,
      decisionManagerMapper,
      billingAddressMapper,
      saleMapper
    )
  );
}

export default middleware(createGooglepayAuthorizationRequest);
