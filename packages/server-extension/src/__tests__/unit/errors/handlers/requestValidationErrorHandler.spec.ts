import { handleError, RequestValidationError } from '@server-extension/errors';
import { Response } from 'express';
import { Result, ValidationError } from 'express-validator';
import { mockDeep, mockReset } from 'jest-mock-extended';

describe('Error Handlers', () => {
  const response = mockDeep<Response>();

  beforeEach(() => {
    mockReset(response);
  });

  it('Should handle RequestValidationError', () => {
    const validationResult = mockDeep<Result<ValidationError>>();
    validationResult.array.mockReturnValueOnce([
      {
        msg: 'error1',
        location: 'body',
        param: 'param1',
        value: 'value1'
      },
      {
        msg: 'error2',
        location: 'body',
        param: 'param2',
        value: 'value2'
      }
    ]);

    handleError(new RequestValidationError(validationResult), response);

    expect(response.status).toBeCalledWith(400);
    expect(response.json.mock.calls[0][0]).toMatchObject(<OCC.ErrorResponse>{
      status: 400,
      message: 'Request validation has failed. Please check your input',
      errors: [
        {
          message: 'error1',
          'o:errorPath': 'body:param1'
        },
        {
          message: 'error2',
          'o:errorPath': 'body:param2'
        }
      ]
    });
  });
});
