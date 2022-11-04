import { generateDeviceFingerPrintData } from '../deviceFingerprintService';

type ConfigBuilder = (settings: OCC.GatewaySettings) => PaymentMethodConfigProperties;

function buildGooglePayConfig({
  googlePaySdkUrl,
  googlePayEnvironment,
  googlePayGateway,
  googlePayGatewayMerchantId,
  googlePayMerchantId,
  googlePayMerchantName,
  googlePaySupportedNetworks
}: OCC.GatewaySettings): GooglePayConfig {
  return {
    googlePaySdkUrl,
    googlePayEnvironment,
    googlePayGateway,
    googlePayGatewayMerchantId,
    googlePayMerchantId,
    googlePayMerchantName,
    googlePaySupportedNetworks
  };
}

function buildApplePayConfig({ applePaySdkUrl, applePayDisplayName, applePaySupportedNetworks }: OCC.GatewaySettings): ApplePayConfig {
  return {
    applePaySdkUrl,
    applePayDisplayName,
    applePaySupportedNetworks
  };
}

function buildCreditCardConfig({
  payerAuthEnabled,
  flexSdkUrl,
  songbirdUrl
}: OCC.GatewaySettings): CreditCardConfig {
  return {
    payerAuthEnabled,
    flexSdkUrl,
    songbirdUrl
  };
}

export function buildDeviceFingerprintConfig(
  settings: OCC.GatewaySettings
): DeviceFingerprintConfig {
  const { deviceFingerprintEnabled, deviceFingerprintUrl, deviceFingerprintOrgId } = settings;
  return {
    deviceFingerprintEnabled,
    deviceFingerprintUrl,
    deviceFingerprintOrgId,
    deviceFingerprintData: generateDeviceFingerPrintData(settings)
  };
}

export const paymentConfigBuilders: Record<string, ConfigBuilder> = {
  card: buildCreditCardConfig,
  applepay: buildApplePayConfig,
  googlepay: buildGooglePayConfig
};
