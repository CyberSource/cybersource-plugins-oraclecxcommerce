import cacheService from '@server-extension/services/cacheService';
import { sendPaymentMethodsRequest } from '../common';
import gatewaySettings from '../data/gatewaySettings';

describe('OCC - Payment Methods', () => {
  beforeEach(() => {
    cacheService.flushAll();
  });

  it('Should fetch payment method config', async () => {
    const res = await sendPaymentMethodsRequest().expect(200);

    const {
      payerAuthEnabled,
      flexSdkUrl,
      googlePaySdkUrl,
      googlePayEnvironment,
      googlePayMerchantId,
      googlePayGateway,
      googlePayGatewayMerchantId,
      googlePayMerchantName,
      googlePaySupportedNetworks,
      applePaySupportedNetworks
    } = gatewaySettings;

    expect(res.body).toMatchObject({
      paymentMethods: [
        {
          type: 'card',
          config: {
            payerAuthEnabled,
            flexSdkUrl
          }
        },
        {
          type: 'googlepay',
          config: {
            googlePaySdkUrl,
            googlePayEnvironment,
            googlePayGateway,
            googlePayGatewayMerchantId,
            googlePayMerchantId,
            googlePayMerchantName,
            googlePaySupportedNetworks
          }
        },
        {
          type: 'applepay',
          config: {
            applePaySupportedNetworks
          }
        }
      ]
    });
  });

  it('Should fetch empty config when no payment methods configured', async () => {
    gatewaySettings.paymentOptions = '';
    const res = await sendPaymentMethodsRequest().expect(200);

    expect(res.body).toMatchObject({
      paymentMethods: []
    });
  });
});
