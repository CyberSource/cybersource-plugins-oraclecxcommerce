import { PaymentContext } from '@server-extension/common';
import { PtsV2PaymentsPost201Response } from 'cybersource-rest-client';
import { PaymentResponseMapper } from '../../common';

export const mapInstrumentIdentifier = (res: Record<string, any>): string => {
  return res.tokenInformation.instrumentIdentifier.id;
};

export const savedCardPaymentMapper: PaymentResponseMapper = {
  supports: (context: PaymentContext) =>
    Boolean(
      context.data.response?.tokenInformation &&
        context.data.response?.tokenInformation.instrumentIdentifier.id
    ),

  map: (context: PaymentContext) => {
    const res = <DeepRequired<PtsV2PaymentsPost201Response>>context.data.response;

    return {
      authorizationResponse: {
        token: mapInstrumentIdentifier(res)
      }
    };
  }
};
