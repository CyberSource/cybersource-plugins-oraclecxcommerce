import { sendValidateRequest, verifyErrorPaths } from '../common';
import gatewaySettings from '../data/gatewaySettings';

describe.skipNotSupported('OCC - Apple Pay', 'applepay', () => {
  it('Should create session', async () => {
    const res = await sendValidateRequest({
      validationUrl: 'https://apple-pay-gateway.apple.com/paymentservices/startSession'
    });

    expect(res.body.domainName).toEqual(gatewaySettings.applePayInitiativeContext);
  });

  it('Should throw error if validationUrl is missing', async () => {
    const res = await sendValidateRequest({});

    verifyErrorPaths(res.body.errors, ['body:validationUrl']);
    expect(res.status).toEqual(400);
    expect(res.body).toMatchObject(<OCC.ErrorResponse>{
      status: 400,
      message: 'Request validation has failed. Please check your input'
    });
  });

  it('Should throw error if validationUrl is not a valid Url', async () => {
    const res = await sendValidateRequest({ validationUrl: 'invalid' });

    verifyErrorPaths(res.body.errors, ['body:validationUrl']);
    expect(res.status).toEqual(400);
    expect(res.body).toMatchObject(<OCC.ErrorResponse>{
      status: 400,
      message: 'Request validation has failed. Please check your input'
    });
  });

  it('Should throw error if request fails', async () => {
    const res = await sendValidateRequest({ validationUrl: 'https://wrongUrl.com' });

    expect(res.status).toEqual(500);
    expect(res.body).toMatchObject(<OCC.ErrorResponse>{
      status: 500,
      message: 'An error occurred while executing request'
    });
  });
});
