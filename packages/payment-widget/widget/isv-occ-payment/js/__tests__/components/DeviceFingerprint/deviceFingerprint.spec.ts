import { DeviceFingerprint } from '@payment-widget/components/DeviceFingerprint';
import loadScript from '@payment-widget/components/utils/scriptLoader';
import paymentActions, { PaymentAction } from '@payment-widget/store/paymentActions';
import ko from 'knockout';

jest.mock('@payment-widget/components/utils/scriptLoader');
jest.mock('@payment-widget/store/paymentActions');

const deviceFingerprintData = {
  sessionId: 'sessionId',
  cipher: { encrypted: 'encrypted', iv: 'iv' }
};

const config = (deviceFingerprintEnabled = true) =>
  ko.observable({
    paymentMethods: [],
    deviceFingerprint: {
      deviceFingerprintEnabled,
      deviceFingerprintUrl: 'https://deviceFingerprint',
      deviceFingerprintOrgId: 'orgId',
      deviceFingerprintData
    }
  });

const createComponent = (config: KnockoutObservable<OCC.PaymentMethodResponse>) =>
  new DeviceFingerprint({ config });

describe('Payment Component - Device Fingerprint', () => {
  it('should trigger device fingerprint data collection', () => {
    createComponent(config(true));

    expect(loadScript).toHaveBeenCalledWith(
      'https://deviceFingerprint?org_id=orgId&session_id=sessionId'
    );
  });

  it('should not collect device fingerprint in case it is disabled', () => {
    createComponent(config(false));

    expect(loadScript).not.toHaveBeenCalled();
    expect(paymentActions.takePaymentAction).not.toHaveBeenCalled();
  });

  describe('Decorate Payment Details', () => {
    const customProperties = {};
    const paymentAction = <PaymentAction>{
      type: 'decoratePaymentDetails',
      paymentMethod: 'card',
      payload: {
        customProperties
      }
    };

    it('should decorate payment details when device fingerprint is enabled', () => {
      const component = createComponent(config(true));

      component.decoratePaymentDetails(paymentAction);

      expect(customProperties).toMatchObject({
        deviceFingerprintSessionId: 'sessionId',
        deviceFingerprintCipherEncrypted: 'encrypted',
        deviceFingerprintCipherIv: 'iv'
      });
    });

    it('should not decorate payment details when device fingerprint is disabled', () => {
      const component = createComponent(config(false));

      component.decoratePaymentDetails(paymentAction);

      expect(customProperties).toMatchObject({});
    });
  });
});
