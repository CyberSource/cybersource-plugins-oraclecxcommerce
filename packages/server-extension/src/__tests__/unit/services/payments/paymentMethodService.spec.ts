import paymentMethods from '@server-extension/services/payments/paymentMethod/paymentMethodService';
import { mockDeep, mockReset } from 'jest-mock-extended';

describe('OCC Payment method service', () => {
  const gatewaySettings = mockDeep<OCC.GatewaySettings>();

  beforeEach(() => {
    mockReset(gatewaySettings);
  });

  it('Should create credit card payment method config', () => {
    gatewaySettings.payerAuthEnabled = true;
    gatewaySettings.flexSdkUrl = 'test_sdk_url';
    gatewaySettings.paymentOptions = 'card';
    const config = paymentMethods(gatewaySettings);

    expect(config).toMatchObject({
      paymentMethods: [
        {
          type: 'card',
          config: {
            payerAuthEnabled: true,
            flexSdkUrl: 'test_sdk_url'
          }
        }
      ]
    });
  });

  it('Should create google pay payment method config', () => {
    gatewaySettings.googlePaySdkUrl = 'test_sdk_url';
    gatewaySettings.googlePayEnvironment = 'test';
    gatewaySettings.googlePayGateway = 'test_gateway';
    gatewaySettings.googlePayGatewayMerchantId = 'test_gateway_merchant';
    gatewaySettings.googlePayMerchantId = 'test_merchant';
    gatewaySettings.googlePayMerchantName = 'merchant';
    gatewaySettings.paymentOptions = 'googlepay';
    gatewaySettings.googlePaySupportedNetworks = 'VISA';
    const config = paymentMethods(gatewaySettings);

    expect(config).toMatchObject({
      paymentMethods: [
        {
          type: 'googlepay',
          config: {
            googlePaySdkUrl: 'test_sdk_url',
            googlePayEnvironment: 'test',
            googlePayGateway: 'test_gateway',
            googlePayGatewayMerchantId: 'test_gateway_merchant',
            googlePayMerchantId: 'test_merchant',
            googlePayMerchantName: 'merchant',
            googlePaySupportedNetworks: 'VISA'
          }
        }
      ]
    });
  });

  it('Should create apple pay payment method config', () => {
    gatewaySettings.applePayMerchantId = 'test_mechant_id';
    gatewaySettings.applePayInitiative = 'web';
    gatewaySettings.applePayInitiativeContext = 'store';
    gatewaySettings.paymentOptions = 'applepay';
    gatewaySettings.applePaySupportedNetworks = 'visa,masterCard,amex,discover';
    const config = paymentMethods(gatewaySettings);

    expect(config).toMatchObject({
      paymentMethods: [
        {
          type: 'applepay',
          config: {
            applePaySupportedNetworks: 'visa,masterCard,amex,discover'
          }
        }
      ]
    });
  });

  it('Should return empty payment method config', () => {
    gatewaySettings.paymentOptions = '';
    const config = paymentMethods(gatewaySettings);

    expect(config).toMatchObject({
      paymentMethods: []
    });
  });
});
