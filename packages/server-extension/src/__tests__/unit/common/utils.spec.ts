import { validateRequest } from '@server-extension/common';
import { RequestValidationError } from '@server-extension/errors';
import { Request, Response } from 'express';
import { Result, ValidationError, validationResult } from 'express-validator';
import { mockDeep, mockReset } from 'jest-mock-extended';
import { mocked } from 'ts-jest/utils';

jest.mock('express-validator');

describe('Common Utils', () => {
  const request = mockDeep<Request>();
  const response = mockDeep<Response>();
  const next = jest.fn();
  const result = mockDeep<Result<ValidationError>>();

  beforeEach(() => {
    mockReset(result);
  });

  it('Should validate request and throw error', () => {
    result.isEmpty.mockReturnValueOnce(false);
    mocked(validationResult).mockReturnValueOnce(result);

    expect(() => validateRequest(request, response, next)).toThrow(RequestValidationError);
    expect(next).not.toBeCalled();
  });

  it('Should validate request and pass it through if it is valid', () => {
    result.isEmpty.mockReturnValueOnce(true);
    mocked(validationResult).mockReturnValueOnce(result);

    validateRequest(request, response, next);

    expect(next).toBeCalledTimes(1);
  });
});
