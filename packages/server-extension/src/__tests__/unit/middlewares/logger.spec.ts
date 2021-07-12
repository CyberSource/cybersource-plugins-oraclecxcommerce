import loggerMiddleware from '@server-extension/middlewares/logger';
import loggingService from '@server-extension/services/loggingService';
import { Request, Response } from 'express';
import { mockDeep } from 'jest-mock-extended';

jest.mock('@server-extension/services/loggingService');

describe('Middleware - Logger', () => {
  const request = mockDeep<Request>();
  const response = mockDeep<Response>();
  const next = jest.fn();

  it('should log API access', () => {
    request.protocol = 'http';
    request.method = 'get';
    request.url = '/url';

    loggerMiddleware(request, response, next);

    expect(loggingService.info).toBeCalledWith('logging.api.access', 'HTTP GET /url');
  });
});
