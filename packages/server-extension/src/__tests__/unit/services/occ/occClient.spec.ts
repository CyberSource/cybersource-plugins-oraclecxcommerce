import occClient from '@server-extension/services/occ/occClient';
import { mockDeep, mockReset } from 'jest-mock-extended';
import nconf from 'nconf';
import { mocked } from 'ts-jest/utils';
import { Logger } from 'winston';

jest.mock('nconf');

describe('OCC SDK Client', () => {
  const logger = mockDeep<Logger>();
  const nconfMock = mocked(nconf);

  beforeEach(() => {
    mockReset(logger);
  });

  it('Should create new SDK from configuration', () => {
    nconfMock.get.mockReturnValueOnce('hostname').mockReturnValueOnce('apiKey');

    occClient.init(logger);
    const sdk = occClient.sdk;

    expect(sdk.host).toEqual('hostname');
    expect(sdk.applicationKey).toEqual('apiKey');
    expect(sdk.logger).toEqual(logger);

    expect(nconfMock.get).toHaveBeenNthCalledWith(1, 'atg.server.admin.url');
    expect(nconfMock.get).toHaveBeenNthCalledWith(
      2,
      'atg.application.credentials:atg.application.token'
    );
  });
});
