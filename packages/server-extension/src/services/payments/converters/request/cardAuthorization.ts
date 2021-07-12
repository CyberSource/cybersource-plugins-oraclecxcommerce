import { middleware, PaymentContext } from '@server-extension/common';
import { CreatePaymentRequest } from 'cybersource-rest-client';
import { convertRequest, twoDecimal } from './common';
import {
  billingAddressMapper,
  decisionManagerMapper,
  deviceFingerprintMapper,
  payerAuthEnrollMapper,
  payerAuthValidationMapper,
  plainCardPaymentMapper,
  saleMapper,
  savedCardPaymentMapper,
  savePaymentTokenMapper,
  transientTokenInfoMapper
} from './mappers';

export function createAuthorizationRequest(context: PaymentContext) {
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
    transientTokenInfoMapper,
    savePaymentTokenMapper,
    payerAuthEnrollMapper,
    payerAuthValidationMapper,
    decisionManagerMapper,
    deviceFingerprintMapper,
    billingAddressMapper,
    saleMapper
  );
}

export default middleware(createAuthorizationRequest);
