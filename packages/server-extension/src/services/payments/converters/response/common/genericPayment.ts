import { PaymentContext } from '@server-extension/common';
import { PtsV2PaymentsPost201Response } from 'cybersource-rest-client';
import { responseCodeMappings, SUCCESS_RESPONSE_CODES } from '../common';

type PspResponse = PtsV2PaymentsPost201Response;

export default function convert(context: PaymentContext): OCC.GenericWebhookResponse {
  const { webhookRequest } = context;
  const paymentResponse = <DeepRequired<PspResponse>>context.data.response;
  const responseCode = responseCodeMappings(paymentResponse.status, webhookRequest.transactionType);
  const { processorInformation } = <DeepRequired<PtsV2PaymentsPost201Response>>paymentResponse;
  const success = SUCCESS_RESPONSE_CODES.includes(responseCode);

  return {
    orderId: webhookRequest.orderId,
    channel: webhookRequest.channel,
    locale: webhookRequest.locale,
    transactionType: webhookRequest.transactionType,
    currencyCode: webhookRequest.currencyCode,
    amount: webhookRequest.amount,

    paymentId: webhookRequest.paymentId,
    hostTimestamp: new Date().toISOString(),
    hostTransactionId: paymentResponse.id,
    merchantTransactionId: webhookRequest.transactionId,

    response: {
      code: responseCode,
      reason: paymentResponse.status,
      success
    },

    additionalProperties: {
      responseReason: paymentResponse.status,
      authAvsCode: processorInformation?.avs?.code,
      authTime: paymentResponse.submitTimeUtc
    }

  };
}
