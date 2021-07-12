import { buildDeviceFingerprintConfig, paymentConfigBuilders } from './configBuilder';

export default function paymentMethods(settings: OCC.GatewaySettings): PaymentMethods {
  const { paymentOptions } = settings;

  const paymentConfigs = paymentOptions
    .split(',')
    .filter(Boolean)
    .map((paymentOption) => {
      return {
        type: paymentOption,
        config: {
          ...paymentConfigBuilders[paymentOption](settings)
        }
      };
    });

  return {
    paymentMethods: paymentConfigs,
    deviceFingerprint: buildDeviceFingerprintConfig(settings)
  };
}
