import validateSignature from '@server-extension/middlewares/validateWebhook';
import validateWebhookPayloadSignature from '@server-extension/services/occ/webhookSignatureValidation';
import { Request, Response } from 'express';
import { mockDeep } from 'jest-mock-extended';
import nconf from 'nconf';
import { mocked } from 'ts-jest/utils';

jest.mock('nconf');
jest.mock('@server-extension/services/occ/webhookSignatureValidation');

const HEADER_NAME = 'x-oracle-cc-webhook-signature';
const WEBHOOK_URL = 'http://webhook.example.com';
const SECRET = 'secret';

describe('Webhook Signature Validation', () => {
  const request = mockDeep<Request>();
  const response = mockDeep<Response>();
  const next = jest.fn();

  request.headers = {};

  beforeEach(() => {
    request.headers[HEADER_NAME] = 'signature';
    request.url = WEBHOOK_URL;
    request.rawBody = 'rawBody';
  });

  it('should validate webhook signature', () => {
    mocked(nconf.get).mockReturnValueOnce(SECRET);

    validateSignature(request, response, next);

    expect(validateWebhookPayloadSignature).toBeCalledWith('rawBody', 'signature', SECRET);
  });

  it('should result in error if signature is empty', () => {
    mocked(nconf.get).mockReturnValueOnce(SECRET);
    request.headers[HEADER_NAME] = '';

    expect(() => validateSignature(request, response, next)).toThrowError(
      `Signature not included. Access denied: ${WEBHOOK_URL}`
    );
  });

  it('should skip webhook signature validation for localhost', () => {
    request.hostname = 'localhost';

    validateSignature(request, response, next);

    expect(validateWebhookPayloadSignature).not.toBeCalled();
  });

  it('should skip webhook signature validation if webhook is not configured', () => {
    mocked(nconf.get).mockReturnValueOnce('');

    validateSignature(request, response, next);

    expect(validateWebhookPayloadSignature).not.toBeCalled();
  });
});
