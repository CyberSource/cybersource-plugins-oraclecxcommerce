import { CreatePaymentRequest } from 'cybersource-rest-client';
import { convertRequest, twoDecimal } from './common';
import {
  billingAddressMapper,
  decisionManagerMapper,
  deviceFingerprintMapper,
  payerAuthEnrollMapper,
  payerAuthValidationMapper,
  plainCardPaymentMapper,
  cardSelectionIndicatorMapper,
  saleMapper,
  savedCardPaymentMapper,
  savePaymentTokenMapper,
  transientTokenInfoMapper,
  shippingAddressMapper,
  additionalFieldsMapper,
  buyerRiskInformationMapper,
  lineItemAndSubTotalMapper
} from './mappers';
import { Request, Response } from 'express';
import buildPaymentContext from '@server-extension/services/payments/paymentContextBuilder';

export default function createAuthorizationRequest(req: Request, res: Response) {
  const context = buildPaymentContext(req);
  const { webhookRequest } = context;

  const paymentRequest: CreatePaymentRequest = {
    clientReferenceInformation: {
      code: webhookRequest.orderId
    },
    orderInformation: {
      amountDetails: {
        totalAmount: twoDecimal(webhookRequest.amount),
        currency: webhookRequest.currencyCode
      }
    }
  };

  context.data.request = convertRequest<CreatePaymentRequest>(
    context,
    paymentRequest,
    savedCardPaymentMapper,
    plainCardPaymentMapper,
    cardSelectionIndicatorMapper,
    transientTokenInfoMapper,
    savePaymentTokenMapper,
    payerAuthEnrollMapper,
    payerAuthValidationMapper,
    decisionManagerMapper,
    deviceFingerprintMapper,
    billingAddressMapper,
    shippingAddressMapper,
    saleMapper,
    additionalFieldsMapper,
    buyerRiskInformationMapper,
    lineItemAndSubTotalMapper
  );
}
