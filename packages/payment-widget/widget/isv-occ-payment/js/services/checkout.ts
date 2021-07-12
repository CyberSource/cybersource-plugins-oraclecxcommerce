import ccLogger from 'ccLogger';
import $ from 'jquery';
import pubsub from 'pubsub';
import paymentActions from '../store/paymentActions';
import paymentStore from '../store/paymentStore';

interface ExtendedOrder extends OCC.Order {
  nativeCreateOrder: () => void;
  nativePostOrderCreateOrUpdateSuccess: (data: any) => void;
}

const orderViewModel = () => paymentStore.order() as ExtendedOrder;

const validatePayment = () => {
  paymentActions.validatePayment();

  const validationResults = paymentStore.validationResults;
  if (validationResults().length > 0) {
    validationResults().forEach((result: any) => {
      if (!result.valid) {
        orderViewModel().addValidationError('paymentValidationError', result.message);
      }
    });
  } else {
    // Adding dummy payment details until it is later resolved
    // This will make OCC skip OOTB paymentDetails validations
    orderViewModel().updatePayments([{}]);
  }
};

/**
 * Callback is triggered when payment was successful and order has been submitted to OMS
 * Customer is redirected to order confirmation page afterwards
 */
const onOrderCompleted = (eventData: any) => {
  const paymentResponse = eventData.payment[0];
  const successStatuses = ['AUTHORIZED', 'SETTLED'];

  const paymentResult = {
    success: successStatuses.includes(paymentResponse.paymentState)
  };

  ccLogger.debug('>>> ORDER_COMPLETED, finalize payment', paymentResult);
  paymentActions.finalizePayment(paymentResult);
};

/**
 * Callback is triggered when order submission failed with 500 error
 */
const onOrderSubmissionFail = (eventData: any) => {
  ccLogger.error('>>> Order submission failed', eventData);
  paymentActions.finalizePayment({
    success: false
  });
};

/**
 * An extended version of the native orderViewModel.createOrder which waits until payment details become available
 * Current OCC implementation does not support asynchronous payment details
 */
const createOrder = async () => {
  if (!paymentStore.paymentInProgress()) {
    ccLogger.debug('>>> Initiating payment');
    paymentActions.initiatePayment();
  }

  try {
    const paymentDetails = await paymentActions.takePaymentDetails();
    ccLogger.debug('>>> Payment details retrieved', paymentDetails);

    orderViewModel().updatePayments([paymentDetails]);

    orderViewModel().nativeCreateOrder();
  } catch (error) {
    paymentActions.onPaymentFailed(error);
    ccLogger.error('>>> Failed to retrieve payment details', error);
  }
};

/**
 * An extended version of the native orderViewModel.postOrderCreateOrUpdateSuccess which handles additional actions required to finalize payment
 * This is required by Payer Authentication process where customer takes additional authentication step
 * Once consumer authentication process is finished order placement is handled again
 */
const postOrderCreateOrUpdateSuccess = (data: any) => {
  const paymentResponse = data.payments[0];
  const nextAction = paymentResponse.customPaymentProperties?.action;

  ccLogger.debug('>>> Order create or update success', data);

  if (nextAction) {
    ccLogger.debug('>>> Next payment action', nextAction);
    paymentActions.nextPaymentAction(paymentResponse);

    createOrder();
  } else {
    orderViewModel().nativePostOrderCreateOrUpdateSuccess(data);
  }
};

/**
 * Extend native implementation of both 'handlePlaceOrder' and 'postOrderCreateOrUpdateSuccess' with additional logic
 */
const extendOrderViewModel = () => {
  const orderViewModel = paymentStore.order();

  const nativeCreateOrder = orderViewModel.createOrder.bind(orderViewModel);
  const nativePostOrderCreateOrUpdateSuccess = orderViewModel.postOrderCreateOrUpdateSuccess.bind(
    orderViewModel
  );

  Object.assign(orderViewModel, {
    createOrder,
    postOrderCreateOrUpdateSuccess,
    nativeCreateOrder,
    nativePostOrderCreateOrUpdateSuccess
  });
};

export default {
  init() {
    paymentStore.order().addValidationCallback(validatePayment);

    extendOrderViewModel();

    $.Topic(pubsub.topicNames.ORDER_COMPLETED).subscribe(onOrderCompleted);
    $.Topic(pubsub.topicNames.ORDER_SUBMISSION_FAIL).subscribe(onOrderSubmissionFail);
  }
};
