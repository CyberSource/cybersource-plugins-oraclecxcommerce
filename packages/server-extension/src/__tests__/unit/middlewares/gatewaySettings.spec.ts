import gatewaySettings from '@server-extension/middlewares/gatewaySettings';
import cacheService from '@server-extension/services/cacheService';
import { Request, Response } from 'express';
import { mockDeep } from 'jest-mock-extended';
import nconf from 'nconf';
import { mocked } from 'ts-jest/utils';

jest.mock('@server-extension/services/cacheService');
jest.mock('nconf');

const GATEWAY_SETTINGS = mockDeep<OCC.GatewaySettings>();

const GATEWAY_SETTINGS_RESPONSE = {
  data: {
    storefront: GATEWAY_SETTINGS
  }
};

const PAYLOAD_SETTINGS = <OCC.WebhookGatewaySettings>[
  {
    name: 'name1',
    value: 'value1'
  },
  {
    name: 'name2',
    value: 'true'
  },
  {
    name: 'name3',
    value: 'false'
  }
];

describe('Middleware - GatewaySettings', () => {
  const requestContext: any = {
    channel: 'storefront'
  };
  const request = <Request>{
    body: {},
    headers: {},
    app: {
      locals: requestContext
    }
  };
  const response = mockDeep<Response>();
  const next = jest.fn();

  beforeEach(() => {
    mocked(cacheService.cacheAsync).mockResolvedValueOnce(GATEWAY_SETTINGS_RESPONSE);
  });

  it('should retrieve gateway settings from OCC for a channel', async () => {
    mocked(nconf).get.mockReturnValueOnce(1);
    await gatewaySettings(request, response, next);

    expect(requestContext.gatewaySettings).toEqual(GATEWAY_SETTINGS);
    expect(next).toBeCalledTimes(1);
  });

  it('should retrieve array gateway settings from Webhook payload', async () => {
    mocked(nconf).get.mockReturnValueOnce('enabled');
    request.body.gatewaySettings = PAYLOAD_SETTINGS;

    await gatewaySettings(request, response, next);

    expect(requestContext.gatewaySettings).toEqual(
      expect.objectContaining({
        name1: 'value1',
        name2: true,
        name3: false
      })
    );

    expect(cacheService.cacheAsync).not.toBeCalled();
    expect(next).toBeCalledTimes(1);
  });

  it('should retrieve flat gateway settings from Webhook payload', async () => {
    mocked(nconf).get.mockReturnValueOnce('enabled');
    request.body.gatewaySettings = GATEWAY_SETTINGS;

    await gatewaySettings(request, response, next);

    expect(requestContext.gatewaySettings).toEqual(GATEWAY_SETTINGS);

    expect(cacheService.cacheAsync).not.toBeCalled();
    expect(next).toBeCalledTimes(1);
  });

  it('should not retrieve gateway settings from Webhook payload in case it is disabled', async () => {
    mocked(nconf).get.mockReturnValueOnce('disabled');
    request.body.gatewaySettings = PAYLOAD_SETTINGS;

    await gatewaySettings(request, response, next);

    expect(requestContext.gatewaySettings).toEqual(GATEWAY_SETTINGS);
    expect(next).toBeCalledTimes(1);
  });
});
