import viewModelFactory, { PaymentApple } from '@payment-widget/components/ApplePay';
import occClient from '@payment-widget/services/occClient';
import paymentActions, {
  PaymentAction,
  paymentActionFilter
} from '@payment-widget/store/paymentActions';
import { mockDeep } from 'jest-mock-extended';
import { mocked } from 'ts-jest/utils';
import { createComponent } from '../../common/utils';
import ApplePaySessionMock from './applePaySession';
import paymentStore from '@payment-widget/store/paymentStore';

jest.mock('@payment-widget/components/ApplePay/requestBuilder');
jest.mock('@payment-widget/store/paymentActions');
jest.mock('@payment-widget/services/occClient');

(<any>global).ApplePaySession = ApplePaySessionMock;

async function createTestComponent(supported = true) {
  ApplePaySessionMock.canMakePayments.mockReturnValueOnce(supported);

  return await createComponent<PaymentApple>(viewModelFactory, {});
}

describe('Payment Component - ApplePay', () => {
  beforeEach(() => {
    mocked(paymentActionFilter).mockImplementation((_paymentMethod, _action) => () => true);
  });

  it('should initialize component which supports ApplePay', async () => {
    const component = await createTestComponent();

    expect(component.supported()).toBeTruthy();

    expect(paymentActions.takePaymentAction).toHaveBeenNthCalledWith(
      2,
      expect.any(Function),
      expect.any(Function)
    );
  });

  it('should initialize with ApplePay not being supported', async () => {
    const component = await createTestComponent(false);

    expect(component.supported()).toBeFalsy();
  });

  it('should submit payment details when payment has been authorized by ApplePay', async () => {
    const event = mockDeep<ApplePayJS.ApplePayPaymentAuthorizedEvent>();
    event.payment.token.paymentData = 'token';

    const component = await createTestComponent();
    component.onPaymentAuthorized(event);

    expect(paymentActions.submitPaymentDetails).toBeCalledWith(
      expect.objectContaining({
        type: 'generic',
        customProperties: {
          paymentType: 'applepay',
          paymentToken: JSON.stringify('token')
        }
      })
    );
  });

  it('should initiate payment', async () => {
    const component = await createTestComponent();
    component.initiatePayment({
      type: 'initiate',
      paymentMethod: 'applepay'
    });

    const session = component.session;

    expect(session).not.toBeNull();
    expect(session.onvalidatemerchant).toBeInstanceOf(Function);
    expect(session.onpaymentauthorized).toBeInstanceOf(Function);
    expect(session.oncancel).toBeInstanceOf(Function);
  });

  it.each`
    success  | applePayStatus
    ${true}  | ${ApplePaySession.STATUS_SUCCESS}
    ${false} | ${ApplePaySession.STATUS_FAILURE}
  `('should finalize payment', async ({ success, applePayStatus }) => {
    const component = await createTestComponent();
    component.createSession();

    component.finalizePayment({
      type: 'finalize',
      paymentMethod: 'applepay',
      payload: {
        success
      }
    });

    expect(component.session.completePayment).toBeCalledWith(applePayStatus);
  });

  it('should cancel payment', async () => {
    const component = await createTestComponent();

    component.onCancel(mockDeep<ApplePayJS.Event>());

    expect(paymentActions.rejectPaymentDetails).toBeCalledWith(
      expect.objectContaining({
        type: 'cancel'
      })
    );
  });

  it('should trigger payment by delegating call to order placement', async () => {
    const component = await createTestComponent();

    component.triggerPayment();

    expect(paymentActions.placeOrder).toHaveBeenCalledTimes(1);
  });

  describe('Merchant Validation', () => {
    let component!: PaymentApple;
    const event = mockDeep<ApplePayJS.ApplePayValidateMerchantEvent>();
    (<any>event).validationURL = 'validationURL';

    beforeEach(async () => {
      component = await createTestComponent();
      component.createSession();
    });

    it('should validate merchant', async () => {
      const merchSession = { session: 'session' };
      mocked(occClient.createApplePaySession).mockResolvedValueOnce(merchSession);

      await component.onValidateMerchant(event);

      expect(occClient.createApplePaySession).toBeCalledWith('validationURL');
      expect(component.session.completeMerchantValidation).toBeCalledWith(merchSession);
    });

    it('should fail merchant validation with no further actions', async () => {
      mocked(occClient.createApplePaySession).mockRejectedValueOnce({});

      await component.onValidateMerchant(event);

      expect(component.session.completeMerchantValidation).not.toHaveBeenCalled();
    });
  });

  describe('Payment Validation', () => {
    const paymentAction: PaymentAction = {
      type: 'validate',
      paymentMethod: 'applepay'
    };

    it('should be valid if supported', async () => {
      const component = await createTestComponent();

      expect(component.validate()).toBeTruthy();
    });

    it('should be not valid if ApplePay is not supported', async () => {
      const component = await createTestComponent(false);

      expect(component.validate()).toBeFalsy();
    });

    it('should submit validation error when ApplePay is not supported', async () => {
      const component = await createTestComponent(false);
      component.validatePayment(paymentAction);

      expect(paymentActions.submitValidationResult).toBeCalledWith(
        expect.objectContaining({
          valid: false,
          message: paymentStore.widget.translate('applePayNotSupported')
        })
      );
    });

    it('should validate that ApplePay is supported', async () => {
      const component = await createTestComponent(true);
      component.validatePayment(paymentAction);

      expect(paymentActions.submitValidationResult).not.toHaveBeenCalled();
    });
  });
});
