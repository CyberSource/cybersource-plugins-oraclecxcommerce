import settings from '@isv-occ-payment/payment-gateway/settings.json';

export const gatewaySettings = {
  ...settings,
  ...{
    saleEnabled: '',
    deviceFingerprintEnabled: false
  }
};

export const gatewaySettingsResponse = {
  data: {
    storefront: gatewaySettings
  }
};

export default gatewaySettings;
