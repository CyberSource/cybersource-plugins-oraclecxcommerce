import jwtService from '@server-extension/services/jwtService';
import { sendPaymentRequest, verifyCardResponse } from '../common';
import gatewaySettings from '../data/gatewaySettings';
import { cardAuthPAEnrollRequest, cardAuthPAValidateRequest } from './common';

describe.skipNotSupported('Generic Webhook Request - Card Payments', 'card', () => {
  it('Should handle credit card authorization with payer auth enabled', async () => {
    gatewaySettings.saleEnabled = 'card';

    const response = await sendPaymentRequest(cardAuthPAEnrollRequest).expect(200);

    verifyCardResponse(cardAuthPAEnrollRequest, response.body);
    expect(response.body.authorizationResponse).toMatchObject({
      authCode: 'PENDING_AUTHENTICATION',
      responseCode: '10000',
      responseReason: 'PENDING_AUTHENTICATION',
      responseDescription: 'PENDING_AUTHENTICATION',
      customPaymentProperties: ['authenticationTransactionId', 'acsUrl', 'pareq', 'action'],
      additionalProperties: {
        acsUrl: expect.any(String),
        pareq: expect.any(String),
        authenticationTransactionId: expect.any(String),
        action: 'validateConsumerAuthentication'
      }
    });
  });

  it('Should handle credit card authorization with payer auth validation', async () => {
    gatewaySettings.saleEnabled = 'card';

    const payerAuthEnrollRes = await sendPaymentRequest(cardAuthPAEnrollRequest).expect(200);

    cardAuthPAValidateRequest.customProperties = {
      authJwt: generateAuthJwt(
        payerAuthEnrollRes.body.authorizationResponse.additionalProperties
          .authenticationTransactionId
      )
    };

    const response = await sendPaymentRequest(cardAuthPAValidateRequest).expect(200);

    verifyCardResponse(cardAuthPAValidateRequest, response.body);
    expect(response.body.authorizationResponse).toMatchObject({
      authCode: 'DECLINED',
      responseCode: '9000',
      responseReason: 'DECLINED',
      responseDescription: 'DECLINED'
    });
  });

  it('Should throw error with tampered authJwt', async () => {
    gatewaySettings.payerAuthEnabled = true;

    cardAuthPAValidateRequest.customProperties = {
      authJwt: 'TAMPERED'
    };

    const response = await sendPaymentRequest(cardAuthPAValidateRequest).expect(200);

    verifyCardResponse(cardAuthPAValidateRequest, response.body);
    expect(response.body.authorizationResponse).toMatchObject({
      authCode: 'DECLINED',
      responseCode: '9000',
      responseReason: 'DECLINED',
      responseDescription: 'authJwt is not valid: jwt malformed'
    });
  });
});

function generateAuthJwt(transactionId: string): string {
  return jwtService.sign(
    {
      Payload: {
        Payment: {
          ProcessorTransactionId: transactionId
        },
        ErrorNumber: 0,
        ErrorDescription: 'Success'
      }
    },
    gatewaySettings.payerAuthKey
  );
}
