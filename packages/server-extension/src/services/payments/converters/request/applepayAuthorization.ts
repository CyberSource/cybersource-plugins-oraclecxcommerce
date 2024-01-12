import { CreatePaymentRequest } from 'cybersource-rest-client';
import { convertRequest, twoDecimal } from './common';
import {
  additionalFieldsMapper,
  billingAddressMapper,
  buyerRiskInformationMapper,
  decisionManagerMapper,
  deviceFingerprintMapper,
  saleMapper,
  shippingAddressMapper,
  lineItemAndSubTotalMapper
} from './mappers';
import buildPaymentContext from '@server-extension/services/payments/paymentContextBuilder';
import { Request, Response } from 'express';

export default function createApplepayAuthorizationRequest(req: Request, res: Response) {
  const context = buildPaymentContext(req);
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
    shippingAddressMapper,
    saleMapper,
    additionalFieldsMapper,
    buyerRiskInformationMapper,
    lineItemAndSubTotalMapper
  );
}
