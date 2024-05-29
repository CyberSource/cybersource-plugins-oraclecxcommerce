import { PaymentContext } from '@server-extension/common';
import { convert, MapperLike } from '../common';

export const SUCCESS_RESPONSE_CODES = ['1000', '2000', '3000', '4000', '11000'];

export const responseCodeMappings = (status: string, transactionType: string) => {
  const mapping: Record<string, string> = {
    AUTHORIZED_0100: '1000',
    AUTHORIZED_PENDING_REVIEW_0100: '1000',
    PENDING_AUTHENTICATION_0100: '10000',
    REVERSED_0110: '2000',
    PENDING_0200: '11000',
    PENDING_0400: '3000',
    SALE_COMPLETE_0100: '4000',
    DECLINED_0100: '9000',
    DECLINED_0110: '8000',
    DECLINED_0200: '12000',
    DECLINED_0400: '7000',
    DECLINED: '9000',
    INVALID_REQUEST: '9000',
  };
  return mapping[status + '_' + transactionType] ?? mapping[status];

};

type PspResponseType =
  | 'authorizationResponse'
  | 'captureResponse'
  | 'creditResponse'
  | 'voidResponse';

export const pspResponseTypeMappings: Record<string, PspResponseType> = {
  '0100': 'authorizationResponse',
  '0200': 'captureResponse',
  '0400': 'creditResponse',
  '0110': 'voidResponse'
};

export const twelveDigits = (amount: string): string => {
  return amount.replace(/\./g, '').padStart(12, '0');
};

export function convertResponse<T>(context: PaymentContext, ...mappers: MapperLike<T>[]): T {
  return <T>convert(context, ...mappers);
}

export const AUTH_REVERSAL = {
  NAME: 'ics_auth_reversal',
  RCODE: '1',
  RFLAG: 'SOK'
}


/**
 * 
 * @param delay delay in ms
 */
export const delay = (milliseconds: number) => new Promise(resolve => setTimeout(resolve, milliseconds));

export const responseMessage = (response: any) => {
  const dmStatus = ['AUTHORIZED_RISK_DECLINED', 'DECLINED', 'INVALID_ACCOUNT'];
  const PAYMENT_DECLINED_MESSAGE = 'Your order has not been placed as payment has been declined. Please try again';
  const { errorInformation = {} } = response;
  if (dmStatus.includes(response.status) || dmStatus.includes(errorInformation.reason)) {
    return PAYMENT_DECLINED_MESSAGE;
  }
  else
    return response.status;
}