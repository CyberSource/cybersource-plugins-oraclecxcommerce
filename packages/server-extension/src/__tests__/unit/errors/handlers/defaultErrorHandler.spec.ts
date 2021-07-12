import { handleError } from '@server-extension/errors';
import { Response } from 'express';
import { mockDeep, mockReset } from 'jest-mock-extended';

describe('Error Handlers', () => {
  const response = mockDeep<Response>();

  beforeEach(() => {
    mockReset(response);
  });

  it('Should fallback to default error handler', () => {
    handleError(new Error('error'), response);

    expect(response.status).toBeCalledWith(500);
    expect(response.json.mock.calls[0][0]).toMatchObject({
      status: 500,
      message: 'An error occurred while executing request'
    });
  });
});
