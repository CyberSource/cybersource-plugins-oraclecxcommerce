import contextLoader from '@server-extension/middlewares/contextLoader';
import loggingService from '@server-extension/services/loggingService';
import occClient from '@server-extension/services/occ/occClient';
import { Request, Response } from 'express';
import { mockDeep } from 'jest-mock-extended';
import { mocked } from 'ts-jest/utils';
import { Logger } from 'winston';

jest.mock('@server-extension/services/loggingService');
jest.mock('@server-extension/services/occ/occClient');

describe('Middleware - Context Loader', () => {
  const request = mockDeep<Request>();
  const response = mockDeep<Response>();
  const next = jest.fn();

  const requestContext: any = {};
  const logger = mockDeep<Logger>();

  request.app.locals = requestContext;
  response.locals.logger = logger;

  it('should initialize services and resolve request channel', () => {
    request.body.channel = '';
    request.headers = {
      channel: 'storefront'
    };
    contextLoader(request, response, next);

    expect(requestContext.channel).toEqual('storefront');

    expect(mocked(loggingService).init).toBeCalledWith(logger);
    expect(mocked(occClient).init).toBeCalledWith(logger);
    expect(next).toBeCalledTimes(1);
  });
});
