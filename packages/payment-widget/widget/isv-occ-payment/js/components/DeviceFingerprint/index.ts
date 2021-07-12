import loadScript from '@payment-widget/components/utils/scriptLoader';
import paymentActions, { PaymentAction } from '@payment-widget/store/paymentActions';

const template = '<div style="display: none"></div>';

export interface DeviceFingerprintParams {
  config: KnockoutObservable<OCC.PaymentMethodResponse>;
}

export class DeviceFingerprint {
  config: OCC.PaymentMethodResponse;

  constructor(params: DeviceFingerprintParams) {
    this.config = params.config();

    if (this.config.deviceFingerprint.deviceFingerprintEnabled) {
      this.collectDeviceData();

      paymentActions.takePaymentAction(
        (action) => action.type === 'decoratePaymentDetails',
        this.decoratePaymentDetails.bind(this)
      );
    }
  }

  decoratePaymentDetails(action: PaymentAction) {
    const customProperties = action.payload?.customProperties;
    const deviceFingerprintData = this.config.deviceFingerprint.deviceFingerprintData;

    if (deviceFingerprintData) {
      const {
        sessionId,
        cipher: { encrypted, iv }
      } = deviceFingerprintData;

      customProperties.deviceFingerprintSessionId = sessionId;
      customProperties.deviceFingerprintCipherEncrypted = encrypted;
      customProperties.deviceFingerprintCipherIv = iv;
    }
  }

  collectDeviceData() {
    const {
      deviceFingerprintUrl,
      deviceFingerprintOrgId,
      deviceFingerprintData
    } = this.config.deviceFingerprint;

    loadScript(
      `${deviceFingerprintUrl}?org_id=${deviceFingerprintOrgId}&session_id=${deviceFingerprintData.sessionId}`
    );
  }
}

export default {
  viewModel: DeviceFingerprint,
  template
};
