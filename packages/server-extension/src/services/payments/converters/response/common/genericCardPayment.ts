import { PaymentContext } from '@server-extension/common';
import {
  PtsV2PaymentsCapturesPost201Response,
  PtsV2PaymentsPost201Response,
  PtsV2PaymentsRefundPost201Response,
  PtsV2PaymentsReversalsPost201Response
} from 'cybersource-rest-client';
import { pspResponseTypeMappings, responseCodeMappings, responseMessage } from '../common';
import { addCustomProperties } from './customProperties';

type PspResponse =
  | PtsV2PaymentsPost201Response
  | PtsV2PaymentsCapturesPost201Response
  | PtsV2PaymentsRefundPost201Response
  | PtsV2PaymentsReversalsPost201Response;

export default function convert(context: PaymentContext): OCC.GenericCardWebhookResponse {
  const { webhookRequest } = context;

  const paymentResponse = <DeepRequired<PspResponse>>context.data.response;
  const timestamp = new Date().getTime().toString();
  const pspResponseType = pspResponseTypeMappings[webhookRequest.transactionType];
  const { processorInformation, errorInformation } = <DeepRequired<PtsV2PaymentsPost201Response>>paymentResponse;

  return {
    orderId: webhookRequest.orderId,
    channel: webhookRequest.channel,
    locale: webhookRequest.locale,
    transactionType: webhookRequest.transactionType,
    currencyCode: webhookRequest.currencyCode,

    [pspResponseType]: {
      transactionTimestamp: webhookRequest.transactionTimestamp,
      paymentId: webhookRequest.paymentId,
      transactionId: webhookRequest.transactionId,
      paymentMethod: webhookRequest.paymentMethod,
      gatewayId: webhookRequest.gatewayId,
      siteId: webhookRequest.siteId,
      hostTransactionTimestamp: timestamp, // TODO fix me
      amount: webhookRequest.amount,
      authCode: paymentResponse.status,
      responseCode: responseCodeMappings(paymentResponse.status, webhookRequest.transactionType),
      responseReason: responseMessage(paymentResponse),
      merchantTransactionId: webhookRequest.transactionId,
      hostTransactionId: paymentResponse.id,
      merchantTransactionTimestamp: timestamp,
      additionalProperties: {
        paymentStatus: paymentResponse.status,
        authAvsCode: processorInformation?.avs?.code,
        authCvResult: processorInformation?.cardVerification?.resultCode,
        authTime: paymentResponse.submitTimeUtc,
        dmMsg: errorInformation?.message,
        ...addCustomProperties(webhookRequest)
      }
    }

  };
}
