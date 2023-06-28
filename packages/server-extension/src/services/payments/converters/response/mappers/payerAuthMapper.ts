import { PaymentContext } from '@server-extension/common';
import { PtsV2PaymentsPost201Response } from 'cybersource-rest-client';
import { PaymentResponseMapper } from '../../common';

export const mapConsumerAuthToken = (info: Record<string, any>): string => {
  return info.token;
};

export const payerAuthMapper: PaymentResponseMapper = {
  supports: (context: PaymentContext) =>
    Boolean(context.data.response?.status == 'PENDING_AUTHENTICATION'),

  map: (context: PaymentContext) => {
    const res = <DeepRequired<PtsV2PaymentsPost201Response>>context.data.response;
    const { consumerAuthenticationInformation } = res;

    return {
      authorizationResponse: {
        additionalProperties: {
          action: 'validateConsumerAuthentication',
          acsUrl: consumerAuthenticationInformation.acsUrl,
          xid: consumerAuthenticationInformation.xid,
          authenticationTransactionId:
            consumerAuthenticationInformation.authenticationTransactionId,
          pareq: consumerAuthenticationInformation.pareq,
          veresEnrolled: consumerAuthenticationInformation.veresEnrolled,
          proxyPan: consumerAuthenticationInformation.proxyPan,
          authenticationPath: consumerAuthenticationInformation.authenticationPath,
          proofXml: consumerAuthenticationInformation.proofXml,
          specificationVersion: consumerAuthenticationInformation.specificationVersion,
          token: mapConsumerAuthToken(consumerAuthenticationInformation),
          stepUpUrl:consumerAuthenticationInformation.stepUpUrl,
          accessToken:consumerAuthenticationInformation.accessToken,
        },
        customPaymentProperties: ['pareq', 'action','stepUpUrl','accessToken']
      }
    };
  }
};
