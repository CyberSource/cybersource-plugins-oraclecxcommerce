import { ApiExecutionError, handleError } from '@server-extension/errors';
import {
  InlineResponseDefault,
  InlineResponseDefaultResponseStatus
} from 'cybersource-rest-client';
import { Response } from 'express';
import { mockDeep, mockReset } from 'jest-mock-extended';

describe('Error Handlers', () => {
  const response = mockDeep<Response>();

  beforeEach(() => {
    mockReset(response);
  });

  it('Should handle ApiExecutionError with ErrorResponse source', () => {
    const apiErrorResponse: InlineResponseDefault = {};
    apiErrorResponse.responseStatus = mockDeep<InlineResponseDefaultResponseStatus>();
    apiErrorResponse.responseStatus = {
      reason: 'VALIDATION_ERROR',
      message: 'Validation Error'
    };

    const error = new ApiExecutionError({
      api: 'API',
      operation: 'operation',
      status: 400,
      source: apiErrorResponse
    });

    handleError(error, response);

    expect(response.status).toBeCalledWith(400);
    expect(response.json.mock.calls[0][0]).toMatchObject({
      status: 400,
      reason: 'VALIDATION_ERROR',
      message: 'Validation Error'
    });
  });
});
