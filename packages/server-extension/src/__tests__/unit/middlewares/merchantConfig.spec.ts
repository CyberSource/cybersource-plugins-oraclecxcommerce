import merchantConfigMiddleware from '@server-extension/middlewares/merchantConfig';
import { Request, Response } from 'express';
import { mockDeep } from 'jest-mock-extended';
import nconf from 'nconf';
import { mocked } from 'ts-jest/utils';

jest.mock('nconf');

describe('Middleware - Merchant Config', () => {
  const request = mockDeep<Request>();
  const response = mockDeep<Response>();
  const next = jest.fn();

  const settings = {
    authenticationType: 'authenticationType',
    runEnvironment: 'runEnvironment',
    merchantID: 'merchantID',
    merchantKeyId: 'merchantKeyId',
    merchantsecretKey: 'merchantsecretKey',
    keyAlias: 'keyAlias',
    keyPass: 'keyPass',
    keyFileName: 'keyFileName',
    keysDirectory: expect.stringMatching('certs'),
    logFilename: 'logFilename',
    logDirectory: 'logDirectory',
    logFileMaxSize: 'logFileMaxSize'
  };

  const requestContext: any = {
    gatewaySettings: settings
  };

  request.app.locals = requestContext;

  const oldEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...oldEnv };
  });

  it('should build merchant config out of gateway settings', () => {
    merchantConfigMiddleware(request, response, next);

    expect(next).toBeCalledTimes(1);
    expect(requestContext.merchantConfig).toMatchObject(settings);
  });

  it.each`
    envProxy     | confProxy
    ${'proxy'}   | ${undefined}
    ${undefined} | ${'proxy'}
  `(
    'should enable proxy settings in case proxy is available (envProxy: $envProxy, confProxy: $confProxy)',
    ({ envProxy, confProxy }) => {
      process.env.http_proxy = envProxy;
      mocked(nconf).get.mockReturnValueOnce(confProxy);

      merchantConfigMiddleware(request, response, next);

      expect(next).toBeCalledTimes(1);
      expect(requestContext.merchantConfig).toMatchObject(settings);
    }
  );
});
