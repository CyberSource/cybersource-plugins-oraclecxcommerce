import { PaymentContext } from '@server-extension/common';
import { PtsV2PaymentsPost201Response } from 'cybersource-rest-client';
import { PaymentResponseMapper } from '../../common';
import { responseCodeMappings } from '../common';

const isNotPendingReview = (context: PaymentContext) =>
  !Boolean(context.data.response?.status == 'AUTHORIZED_PENDING_REVIEW');

export const saleGenericMapper: PaymentResponseMapper = {
  supports: (context: PaymentContext) =>
    context.isValidForPaymentMode('saleEnabled') && isNotPendingReview(context),

  map: (context: PaymentContext) => {
    const paymentResponse = <DeepRequired<PtsV2PaymentsPost201Response>>context.data.response;
    const { webhookRequest } = context;

    const status = paymentResponse.status == 'AUTHORIZED' ? 'SALE_COMPLETE' : paymentResponse.status;

    return {
      additionalProperties: {
        sale: 'true',
        responseReason: status
      },
      response: {
        code: responseCodeMappings(status, webhookRequest.transactionType),
        reason: status
      }
    };
  }
};
