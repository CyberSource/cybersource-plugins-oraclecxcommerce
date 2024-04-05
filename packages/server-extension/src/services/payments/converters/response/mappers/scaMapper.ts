import { PaymentContext } from '@server-extension/common';
import { PaymentResponseMapper } from '../../common';
import { PtsV2PaymentsPost201Response } from 'cybersource-rest-client';
import { responseCodeMappings } from '../common';


export const scaMapper: PaymentResponseMapper = {
  supports: (context: PaymentContext) => {
    const response = <DeepRequired<PtsV2PaymentsPost201Response>>context.data.response;
    return Boolean(response?.status != 'PENDING_AUTHENTICATION' && context.data.response?.errorInformation?.reason == 'CUSTOMER_AUTHENTICATION_REQUIRED' && context.requestContext.gatewaySettings?.payerAuthEnabled && context.webhookRequest.customProperties?.challengeCode != '04') 
  },
  map: (context: PaymentContext) => {
    const { webhookRequest } = context;
    const status = 'PENDING_AUTHENTICATION';

    return {
      authorizationResponse: {
        responseCode: responseCodeMappings(status, webhookRequest.transactionType),
        additionalProperties: {
          scaRequired: 'true'
        }, 
        customPaymentProperties: ['scaRequired']
      }
    };
  }
};
