import { handleError } from '@server-extension/errors';
import errorMiddleware from '@server-extension/middlewares/errorHandler';
import { Request, Response } from 'express';
import { mockDeep } from 'jest-mock-extended';

jest.mock('@server-extension/errors');
jest.mock('@server-extension/services/loggingService');

describe('Middleware - Error Handler', () => {
  const request = mockDeep<Request>();
  const response = mockDeep<Response>();
  const next = jest.fn();

  it('should delegate to next if no error', () => {
    errorMiddleware(undefined, request, response, next);

    expect(next).toBeCalledTimes(1);
    expect(handleError).not.toBeCalled();
  });

  it('should end response if not error and next is not available', () => {
    errorMiddleware(undefined, request, response, undefined);

    expect(response.end).toBeCalledTimes(1);
    expect(next).not.toBeCalled();
    expect(handleError).not.toBeCalled();
  });

  it('should delegate error handling to custom handlers', () => {
    const err = new Error('error)');

    errorMiddleware(err, request, response, undefined);

    expect(response.end).not.toBeCalled();
    expect(next).not.toBeCalled();
    expect(handleError).toBeCalledWith(err, response);
  });
});
