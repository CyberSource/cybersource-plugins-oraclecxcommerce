import { PaymentContext } from '@server-extension/common';
import { PtsV2PaymentsPost201Response } from 'cybersource-rest-client';
import { PaymentResponseMapper } from '../../common';

export const mapConsumerAuthToken = (info: Record<string, any>): string => {
  return info.token;
};

const getPauseRequestId = (res: PtsV2PaymentsPost201Response) => {
  return res?.riskInformation?.profile?.action == 'PAYERAUTH_INVOKE' || res?.riskInformation?.profile?.action == 'PAYERAUTH_EXTERNAL' ? { pauseRequestId: res.id } : {}; 
}

export const payerAuthMapper: PaymentResponseMapper = {
  supports: (context: PaymentContext) => {
    const response = <DeepRequired<PtsV2PaymentsPost201Response>>context.data.response;
    const { consumerAuthenticationInformation } = response;
    return Boolean((response?.status == 'PENDING_AUTHENTICATION' || response?.riskInformation?.profile?.action === 'PAYERAUTH_INVOKE' || response?.riskInformation?.profile?.action === 'PAYERAUTH_EXTERNAL') && response?.riskInformation?.profile?.action !== 'PAYERAUTH_SKIP' && consumerAuthenticationInformation?.acsUrl)
  },
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
          stepUpUrl: consumerAuthenticationInformation.stepUpUrl,
          accessToken: consumerAuthenticationInformation.accessToken,
          ...getPauseRequestId(res),
          ...context.webhookRequest.customProperties?.challengeCode && {challengeCode : '04'}
        },
        customPaymentProperties: ['pareq', 'action', 'stepUpUrl', 'accessToken', 'pauseRequestId','challengeCode']
      }
    };
  }
};
