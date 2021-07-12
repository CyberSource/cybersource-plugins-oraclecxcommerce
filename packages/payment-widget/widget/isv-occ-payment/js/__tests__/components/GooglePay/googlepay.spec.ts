import { Deferred } from '@payment-widget/common/deferred';
import viewModelFactory, { PaymentGoogle } from '@payment-widget/components/GooglePay';
import { getGooglePaymentDataRequest } from '@payment-widget/components/GooglePay/requestBuilder';
import loadScript from '@payment-widget/components/utils/scriptLoader';
import paymentActions, { PaymentAction } from '@payment-widget/store/paymentActions';
import { screen } from '@testing-library/dom';
import { mockDeep } from 'jest-mock-extended';
import { mocked } from 'ts-jest/utils';
import { createComponent } from '../../common/utils';
import PaymentsClient, { isReadyToPay, loadPaymentData } from './paymentClient';
import paymentStore from '@payment-widget/store/paymentStore';

jest.mock('@payment-widget/components/utils/scriptLoader');
jest.mock('@payment-widget/components/GooglePay/requestBuilder');
jest.mock('@payment-widget/store/paymentActions');

(<any>global).google = {
  payments: {
    api: {
      PaymentsClient
    }
  }
};

const PARAMS = {
  config: {
    googlePayEnvironment: 'JEST',
    googlePaySdkUrl: 'googlePaySdkUrl'
  }
};

async function createTestComponent(readyToPay = true) {
  isReadyToPay.mockResolvedValueOnce({
    result: readyToPay
  });

  return await createComponent<PaymentGoogle>(viewModelFactory, PARAMS);
}

describe('Payment Component - GooglePay', () => {
  beforeEach(async () => {
    document.body.innerHTML = `
      <div id="googlePayButtonContainer"></div>
    `;

    mocked(loadScript).mockResolvedValueOnce();
  });

  it('should initialize component and add GooglePay button', async () => {
    const component = await createTestComponent();
    const paymentsClient = (<any>component.paymentsClient) as PaymentsClient;

    // ViewModel is initialized with payment configuration
    expect(component.config).toBe(PARAMS.config);
    expect(component.paymentResult).toBeInstanceOf(Deferred);

    // GooglePay API script is loaded
    expect(loadScript).toBeCalledWith(PARAMS.config.googlePaySdkUrl);

    // An instance of GooglePay API is created for a given environment
    expect(paymentsClient.paymentOptions.environment).toBe(PARAMS.config.googlePayEnvironment);
    expect(component.supported()).toBeTruthy();

    // GooglePay button is added
    expect(screen.getByTestId('googlePayButton')).toBeInTheDocument();
  });

  it('should not add GooglePay button in case GooglePay is not supported', async () => {
    const component = await createTestComponent(false);

    expect(component.supported()).toBeFalsy();
    expect(screen.queryByTestId('googlePayButton')).toBeNull();
  });

  it('should submit payment details when payment has been authorized by GooglePay', async () => {
    const paymentData = mockDeep<google.payments.api.PaymentData>();
    paymentData.paymentMethodData.tokenizationData.token = 'token';

    const component = await createTestComponent();
    component.onPaymentAuthorized(paymentData);

    expect(paymentActions.submitPaymentDetails).toBeCalledWith(
      expect.objectContaining({
        type: 'generic',
        customProperties: {
          paymentType: 'googlepay',
          paymentToken: 'token'
        }
      })
    );
  });

  describe('Initiate Payment', () => {
    const requestData = mockDeep<google.payments.api.PaymentDataRequest>();
    mocked(getGooglePaymentDataRequest).mockReturnValueOnce(requestData);

    const initiateAction: PaymentAction = {
      type: 'initiate',
      paymentMethod: 'googlepay'
    };

    it('should initiate payment by triggering GooglePay popup', async () => {
      const paymentData = mockDeep<google.payments.api.PaymentData>();
      loadPaymentData.mockResolvedValueOnce(paymentData);

      const component = await createTestComponent();
      const result = await component.initiatePayment(initiateAction);

      expect(result).toBe(paymentData);
    });

    it('should reject payment if GooglePay failed to load payment data', async () => {
      loadPaymentData.mockRejectedValueOnce('error');

      const component = await createTestComponent();
      await component.initiatePayment(initiateAction);

      expect(paymentActions.rejectPaymentDetails).toBeCalledWith(
        expect.objectContaining({
          type: 'cancel',
          data: 'error'
        })
      );
    });
  });

  describe('Finalize Payment', () => {
    const finalizeAction = (success: boolean): PaymentAction => ({
      type: 'finalize',
      paymentMethod: 'googlepay',
      payload: {
        success
      }
    });

    it('should finalize with success', async () => {
      const component = await createTestComponent();

      const result = await component.finalizePayment(finalizeAction(true));

      expect(result).toMatchObject({ transactionState: 'SUCCESS' });
    });

    it('should finalize with error', async () => {
      const component = await createTestComponent();

      const result = await component.finalizePayment(finalizeAction(false));

      expect(result).toMatchObject({ transactionState: 'ERROR' });
    });
  });

  describe('Payment Validation', () => {
    const paymentAction: PaymentAction = {
      type: 'validate',
      paymentMethod: 'googlepay'
    };

    it('should be valid if supported', async () => {
      const component = await createTestComponent();

      expect(component.validate()).toBeTruthy();
    });

    it('should be not valid if GooglePay is not supported', async () => {
      const component = await createTestComponent(false);

      expect(component.validate()).toBeFalsy();
    });

    it('should submit validation error when GooglePay is not supported', async () => {
      const component = await createTestComponent(false);
      component.validatePayment(paymentAction);

      expect(paymentActions.submitValidationResult).toBeCalledWith(
        expect.objectContaining({
          valid: false,
          message: paymentStore.widget.translate('googlePayNotSupported')
        })
      );
    });

    it('should validate that GooglePay is supported', async () => {
      const component = await createTestComponent(true);
      component.validatePayment(paymentAction);

      expect(paymentActions.submitValidationResult).not.toHaveBeenCalled();
    });
  });
});
