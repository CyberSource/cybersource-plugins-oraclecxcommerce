import { PaymentContext } from '@server-extension/common';
import cryptoService from '@server-extension/services/cryptoService';
import jwtService from '@server-extension/services/jwtService';
import transientTokenValidator from '@server-extension/services/payments/validators/transientTokenValidator';
import { mockDeep } from 'jest-mock-extended';
import sampleJwk from './sampleJwk.json';

// Creating a sample capture context JWT with custom keys (sampleJwk)
const captureContext = jwtService.sign(
  {
    flx: {
      jwk: sampleJwk
    }
  },
  'secret'
);

const cipher = cryptoService.encrypt(captureContext);

const customProperties = (transientTokenJwt: string) => ({
  transientTokenJwt,
  captureContext,
  captureContextCipherEncrypted: cipher.encrypted,
  captureContextCipherIv: cipher.iv
});

const PRIVATE_KEY = jwtService.jwkToPem(<any>sampleJwk, true);

describe('Transient Token validator', () => {
  const context = mockDeep<PaymentContext>();
  const next = jest.fn();

  beforeEach(() => {
    tokenPayload.exp = Math.floor(Date.now() / 1000) + 60 * 60;
  });

  it('Should throw exception when token is expired', async () => {
    tokenPayload.exp = Math.floor(Date.now() / 1000) - 1000;
    const token = signToken(tokenPayload);
    context.webhookRequest.customProperties = customProperties(token);

    await expect(transientTokenValidator(context, next)).rejects.toEqual(
      new Error('Transient token is not valid: jwt expired')
    );
    expect(next).not.toBeCalled();
  });

  it('Should throw exception when token has been modified', async () => {
    let token = signToken(tokenPayload);
    token = token + 'wrong';
    context.webhookRequest.customProperties = customProperties(token);

    await expect(transientTokenValidator(context, next)).rejects.toEqual(
      new Error('Transient token is not valid: invalid signature')
    );
    expect(next).not.toBeCalled();
  });

  it('Should throw exception when token has been tampered', async () => {
    const token = signToken(tokenPayload);

    const properties = customProperties(token);
    properties.captureContextCipherEncrypted = 'HACK' + properties.captureContextCipherEncrypted;

    context.webhookRequest.customProperties = properties;

    await expect(transientTokenValidator(context, next)).rejects.toEqual(
      new Error('Transient token could not be verified')
    );
    expect(next).not.toBeCalled();
  });

  it('Should pass validation if token is valid', async () => {
    const token = signToken(tokenPayload);
    context.webhookRequest.customProperties = customProperties(token);

    await transientTokenValidator(context, next);

    expect(next).toBeCalledTimes(1);
  });

  it('Should pass validation if token is not provided', async () => {
    context.webhookRequest.customProperties = {};

    await transientTokenValidator(context, next);

    expect(next).toBeCalledTimes(1);
  });
});

const signToken = (token: any) =>
  jwtService.sign(token, PRIVATE_KEY, {
    algorithm: 'RS256'
  });

const tokenPayload = {
  data: {
    expirationYear: '2023',
    number: '411111XXXXXX1111',
    expirationMonth: '03',
    type: '001'
  },
  iss: 'Flex/08',
  exp: Math.floor(Date.now() / 1000) + 60 * 60,
  type: 'mf-0.11.0',
  iat: Math.floor(Date.now() / 1000)
};
