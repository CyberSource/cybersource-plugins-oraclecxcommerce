import authJwtValidator from '@server-extension/services/payments/validators/authJwtValidator';
import { mockDeep } from 'jest-mock-extended';
import { PaymentContext } from '@server-extension/common';
import jwtService from '@server-extension/services/jwtService';

describe('Payer auth jwt validator', () => {
  const context = mockDeep<PaymentContext>();
  const next = jest.fn();
  context.requestContext.gatewaySettings.payerAuthKey = 'payerAuthKey';

  beforeEach(() => {
    tokenPayload.exp = Math.floor(Date.now() / 1000) + 60 * 60;
  });

  it('Should throw exception if signed with a different key', async () => {
    const token = jwtService.sign(tokenPayload, 'wrongKey');
    context.webhookRequest.customProperties = { authJwt: token };

    await expect(authJwtValidator(context, next)).rejects.toEqual(
      new Error('authJwt is not valid: invalid signature')
    );
    expect(next).not.toBeCalled();
  });

  it('Should throw exception when token is expired', async () => {
    tokenPayload.exp = Math.floor(Date.now() / 1000) - 1000;
    const token = jwtService.sign(tokenPayload, 'payerAuthKey');
    context.webhookRequest.customProperties = { authJwt: token };

    await expect(authJwtValidator(context, next)).rejects.toEqual(
      new Error('authJwt is not valid: jwt expired')
    );
    expect(next).not.toBeCalled();
  });

  it('Should throw exception when token has been modified', async () => {
    let token = jwtService.sign(tokenPayload, 'payerAuthKey');
    token = token + 'wrong';
    context.webhookRequest.customProperties = { authJwt: token };

    await expect(authJwtValidator(context, next)).rejects.toEqual(
      new Error('authJwt is not valid: invalid signature')
    );
    expect(next).not.toBeCalled();
  });

  it('Should pass validation if token is valid', async () => {
    const token = jwtService.sign(tokenPayload, 'payerAuthKey');
    context.webhookRequest.customProperties = { authJwt: token };

    await authJwtValidator(context, next);

    expect(next).toBeCalledTimes(1);
  });

  it('Should pass validation if token is not provided', async () => {
    context.webhookRequest.customProperties = {};

    await authJwtValidator(context, next);

    expect(next).toBeCalledTimes(1);
  });
});

const tokenPayload = {
  iss: '5cd72bf20e423d0f7ce2edea',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 60 * 60,
  jti: 'f4906b41-f0e5-4505-b62b-2d4bdb895b6a',
  ConsumerSessionId: '0_b970df92-c453-4e48-9b0f-b87b486e19ef',
  ReferenceId: '0_b970df92-c453-4e48-9b0f-b87b486e19ef',
  aud: 'o30039-c7b904b5-6abb-0734-2b98-9250eaacb0a8',
  Payload: {
    Payment: {
      Type: 'CCA',
      ProcessorTransactionId: '2T3U1cJp9B89KYJKfzG0'
    },
    ErrorNumber: 0,
    ErrorDescription: 'Success'
  }
};
