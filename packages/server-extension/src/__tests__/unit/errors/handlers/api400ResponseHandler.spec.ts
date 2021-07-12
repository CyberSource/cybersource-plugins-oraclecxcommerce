import { ApiExecutionError, handleError } from '@server-extension/errors';
import { PtsV2PaymentsPost400Response } from 'cybersource-rest-client';
import { Response } from 'express';
import { mockDeep, mockReset } from 'jest-mock-extended';

describe('Error Handlers', () => {
  const response = mockDeep<Response>();

  beforeEach(() => {
    mockReset(response);
  });

  it('Should handle ApiExecutionError with 400 Response', () => {
    let apiErrorResponse = mockDeep<PtsV2PaymentsPost400Response>();
    apiErrorResponse = {
      status: '400',
      reason: 'VALIDATION_ERROR',
      message: 'Validation Error',
      details: [
        {
          field: 'paymentInformation.card.number',
          reason: 'MISSING_FIELD'
        }
      ]
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
      message: 'Validation Error',
      devMessage: [
        {
          field: 'paymentInformation.card.number',
          reason: 'MISSING_FIELD'
        }
      ]
    });
  });
});
