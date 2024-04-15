import { PaymentContext } from '@server-extension/common';
import { PtsV2PaymentsPost201Response } from 'cybersource-rest-client';
import { PaymentResponseMapper } from '../../common';
import { responseCodeMappings, twelveDigits } from '../common';

const isNotPayerAuthEnrollment = (context: PaymentContext) =>
  !Boolean(context.data.response?.status == 'PENDING_AUTHENTICATION');

const isNotPendingReview = (context: PaymentContext) =>
  !Boolean(context.data.response?.status == 'AUTHORIZED_PENDING_REVIEW');

const isNotScaChallenged = (context: PaymentContext) =>
   !Boolean(context.data.response?.errorInformation?.reason == 'CUSTOMER_AUTHENTICATION_REQUIRED');

export const saleCardMapper: PaymentResponseMapper = {
  supports: (context: PaymentContext) =>
    context.isValidForPaymentMode('saleEnabled') &&
    isNotPayerAuthEnrollment(context) &&
    isNotPendingReview(context) && 
    isNotScaChallenged(context),


  map: (context: PaymentContext) => {
    const paymentResponse = <DeepRequired<PtsV2PaymentsPost201Response>>context.data.response;
    const { webhookRequest } = context;

    const status = paymentResponse.status == 'AUTHORIZED' ? 'SALE_COMPLETE' : paymentResponse.status;

    return {
      authorizationResponse: {
        amount:
          paymentResponse.orderInformation &&
          twelveDigits(paymentResponse.orderInformation.amountDetails.authorizedAmount),
        authCode: status,
        responseCode: responseCodeMappings(status, webhookRequest.transactionType),
        responseReason: status,
        responseDescription: status,
        additionalProperties: {
          sale: 'true'
        },
        customPaymentProperties: ['sale']
      }
    };
  }
};
