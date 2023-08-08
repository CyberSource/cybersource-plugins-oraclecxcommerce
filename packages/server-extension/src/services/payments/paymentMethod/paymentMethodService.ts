import { buildDeviceFingerprintConfig, paymentConfigBuilders } from './configBuilder';

export default function paymentMethods(settings: OCC.GatewaySettings): PaymentMethods {

  const { paymentOptions, paymentMethodTypes } = settings;
  const isCardPaymentEnabled = paymentMethodTypes.includes("card");
  const isGenericPaymentEnabled = paymentMethodTypes.includes("generic");

  const paymentConfigs = paymentOptions
    .split(',')
    .filter(Boolean)
    .map((paymentOption) => {
      if ((paymentOption === "card" && isCardPaymentEnabled) || (paymentOption !== "card" && isGenericPaymentEnabled)) {
        return {
          type: paymentOption,
          config: {
            ...paymentConfigBuilders[paymentOption](settings)
          }
        };
      }
      return null;
    })
    .filter(Boolean) as PaymentMethodConfig[];

  return {
    paymentMethods: paymentConfigs,
    deviceFingerprint: buildDeviceFingerprintConfig(settings)
  };
}
