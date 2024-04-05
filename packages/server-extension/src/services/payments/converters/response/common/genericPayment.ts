import { PaymentContext } from '@server-extension/common';
import { PtsV2PaymentsPost201Response } from 'cybersource-rest-client';
import { responseCodeMappings, responseMessage, SUCCESS_RESPONSE_CODES } from '../common';
import { addCustomProperties } from './customProperties';

type PspResponse = PtsV2PaymentsPost201Response;

export default function convert(context: PaymentContext): OCC.GenericWebhookResponse {
  const { webhookRequest } = context;
  const paymentResponse = <DeepRequired<PspResponse>>context.data.response;
  const responseCode = responseCodeMappings(paymentResponse.status, webhookRequest.transactionType);
  const { processorInformation, errorInformation } = <DeepRequired<PtsV2PaymentsPost201Response>>paymentResponse;
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
      reason: responseMessage(paymentResponse),
      success
    },

    additionalProperties: {
      paymentStatus: paymentResponse.status,
      authAvsCode: processorInformation?.avs?.code,
      authTime: paymentResponse.submitTimeUtc,
      dmMsg: errorInformation?.message,
      ...addCustomProperties(webhookRequest)
    }

  };
}
