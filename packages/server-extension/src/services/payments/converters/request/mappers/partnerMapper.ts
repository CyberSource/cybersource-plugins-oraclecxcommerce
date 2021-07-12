import { PaymentContext } from '@server-extension/common';
import { Mapper } from '@server-extension/services/payments/converters/common';
import {
  AuthReversalRequest,
  CapturePaymentRequest,
  CreatePaymentRequest,
  RefundCaptureRequest
} from 'cybersource-rest-client';
import nconf from 'nconf';

type PaymentRequest =
  | CreatePaymentRequest
  | CapturePaymentRequest
  | AuthReversalRequest
  | RefundCaptureRequest;

const DEVELOPER_ID_KEY = 'partner.developerId';
const SOLUTION_ID_KEY = 'partner.solutionId';

export const partnerMapper: Mapper<PaymentRequest> = {
  supports: (_context: PaymentContext) =>
    Boolean(nconf.get(DEVELOPER_ID_KEY) && nconf.get(SOLUTION_ID_KEY)),

  map: () => {
    return <PaymentRequest>{
      clientReferenceInformation: {
        partner: {
          developerId: nconf.get(DEVELOPER_ID_KEY),
          solutionId: nconf.get(SOLUTION_ID_KEY)
        }
      }
    };
  }
};
