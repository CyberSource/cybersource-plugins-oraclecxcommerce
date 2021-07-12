import { ApiExecutionError } from '@server-extension/errors';
import * as paymentCommand from '@server-extension/services/payments/api/paymentCommand';
import { sendCreateCaptureContextRequest, verifyErrorPaths } from '../common';

describe.skipNotSupported('Flex Microform - CaptureContext', 'card', () => {
  const req = { targetOrigin: 'http://localhost:8080' };
  it('Should generate flex capture context key Id', async () => {
    const res = await sendCreateCaptureContextRequest(req).expect(200);

    expect(res.body).toHaveProperty('captureContext');
  });

  it('Should fail to generate flex capture context for target origin with invalid protocol', async () => {
    const req = { targetOrigin: 'http://testdomain:8080' };

    const res = await sendCreateCaptureContextRequest(req).expect(400);

    expect(res.body).toMatchObject({
      status: 400,
      message: 'Request validation has failed. Please check your input',
      errors: [
        {
          message: 'The HTTP protocol is supported only for local development',
          'o:errorPath': 'body:targetOrigin'
        }
      ]
    });
  });

  it('Should fail to generate flex capture context for empty target origin', async () => {
    const req = { targetOrigin: '' };

    const res = await sendCreateCaptureContextRequest(req).expect(400);

    verifyErrorPaths(res.body.errors, ['body:targetOrigin']);
    expect(res.body).toMatchObject({
      status: 400,
      message: 'Request validation has failed. Please check your input'
    });
  });

  it('Should fail to generate flex capture context for target origin with no protocol', async () => {
    const req = { targetOrigin: 'https:localhost:8080' };

    const res = await sendCreateCaptureContextRequest(req).expect(400);

    verifyErrorPaths(res.body.errors, ['body:targetOrigin']);
    expect(res.body).toMatchObject({
      status: 400,
      message: 'Request validation has failed. Please check your input'
    });
  });

  it('Should fail to generate flex capture context for target origin that includes path', async () => {
    const req = { targetOrigin: 'http://localhost:8080/unexpected_path' };

    const res = await sendCreateCaptureContextRequest(req).expect(400);

    expect(res.body).toMatchObject({
      status: 400,
      reason: 'VALIDATION_ERROR',
      message: 'One or more validation errors occurred',
      devMessage: [
        {
          location: 'targetOrigin',
          message:
            'Target Origin[0] must not contain a path, query parameter or fragment identifier'
        }
      ]
    });
  });

  it('Should fail to generate flex capture context when cybs request fails', async () => {
    const spy = jest.spyOn(paymentCommand, 'default');
    spy.mockImplementation(() =>
      Promise.reject(
        new ApiExecutionError({
          api: 'testAPI',
          operation: 'testCreatePublicKey',
          status: 500,
          source: {}
        })
      )
    );
    const res = await sendCreateCaptureContextRequest(req).expect(500);

    expect(spy).toHaveBeenCalled();
    expect(res.body).toMatchObject({
      status: 500,
      message: 'An error occurred while executing request'
    });
  });
});
