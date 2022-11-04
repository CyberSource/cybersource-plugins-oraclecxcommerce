/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.
 */
import {StoreContext, OrderContext, ContainerContext} from '@oracle-cx-commerce/react-ui/contexts';
import React, {useState, useContext} from 'react';
import Styled from '@oracle-cx-commerce/react-components/styled';
import css from '@oracle-cx-commerce/react-widgets/checkout/checkout-place-order-button/styles.css';
import {
  handleOrderSubmitSuccess,
  handleOrderSubmitFailure
} from '@oracle-cx-commerce/react-widgets/checkout/checkout-place-order-button/utils';
import {connect} from '@oracle-cx-commerce/react-components/provider';
import {getComponentData} from '@oracle-cx-commerce/react-widgets/checkout/checkout-place-order-button/selectors';
import {
  PAYMENT_METHOD_TOKENIZED_CREDIT_CARD,
  PAYMENT_METHOD_CREDIT_CARD,
  PAYMENT_METHOD_INVOICE_REQUEST,
  PAYMENT_METHOD_ONLINE_PAYMENT_GROUP,
  PAYMENT_TYPE_INVOICE,
  PAYMENT_TYPE_CARD
} from '@oracle-cx-commerce/commerce-utils/constants';
import {useNavigator} from '@oracle-cx-commerce/react-components/link';
import {noop, formatDate} from '@oracle-cx-commerce/utils/generic';
import {getPayerAuthPaymentGroup} from '@oracle-cx-commerce/react-components/utils/payment';
import {replaceSpecialCharacter} from '../isv-payment-method/isv-payment-utility/common';
var responseJwt;
/**
 * Widget to display place order button and handle order submission
 * @param {props} component props
 */
const IsvCheckoutPlaceOrderButton = props => {
  //locales
  const {
    buttonPlaceOrder,
    buttonPlacingOrder,
    alertOrderNotPlacedPaymentDeclined,
    alertTechnicalProblemContactUs,
    buttonScheduledOrder,
    buttonSchedulingOrder,
    currentOrderId,
    headingPayment,
    messageFailed
  } = props;
  //context
  const {paymentGroups = {}, shippingGroups = {}} = useContext(OrderContext);
  const {guestEmailDetails = {}, setPlaceOrderInitiated = noop} = useContext(ContainerContext);
  const {getState, action} = useContext(StoreContext);
  //selector data
  const {authenticated, isCurrentOrderScheduled = false} = props;
  const submitButtonName = isCurrentOrderScheduled ? buttonScheduledOrder : buttonPlaceOrder;
  const processButtonName = isCurrentOrderScheduled ? buttonSchedulingOrder : buttonPlacingOrder;
  const [inProgress, setInProgress] = useState(false);
  const goToPage = useNavigator();
  /**
   * Method to invoke when current order is converted(placed) as scheduled order
   */
  const placeScheduledOrder = () => {
    const {scheduleInfo} = props;
    const schedulePayload = {
      ...scheduleInfo,
      startDate: formatDate(scheduleInfo.startDate),
      endDate: formatDate(scheduleInfo.endDate)
    };
    const {daysInMonth, ...sceduleInfoFinal} = schedulePayload.schedule;
    if (daysInMonth && daysInMonth.length === 0) {
      schedulePayload.schedule = sceduleInfoFinal;
    }
    action('convertCartToScheduledOrder', schedulePayload).then(response => {
      setInProgress(false);
      setPlaceOrderInitiated(false);
      if (response.ok === true) {
        const payload = {
          scheduledOrders: {
            [currentOrderId]: null
          }
        };
        try {
          action('saveComponentData', {...payload});
        } catch (error) {
          console.error(error);
        }
        const messages = {alertOrderNotPlacedPaymentDeclined, alertTechnicalProblemContactUs};
        handleOrderSubmitSuccess(goToPage, response, action, messages);
      } else {
        handleOrderSubmitFailure(action, goToPage, response);
      }
    });
  };

  /**
   * Method to invoke the place order action
   */
  const placeOrder = async () => {
    const appliedPaymentGroups = [];
    for (const index of Object.keys(paymentGroups)) {
      const paymentGroup = paymentGroups[index];
      //Exclude zero value payment groups or
      //Zero value with only one payment group
      if (paymentGroup.amount !== 0 || (paymentGroup.amount === 0 && Object.keys(paymentGroups).length === 1)) {
        const {paymentGroupId, paymentMethod} = paymentGroup;
        if (paymentMethod === PAYMENT_METHOD_CREDIT_CARD || paymentMethod === PAYMENT_METHOD_TOKENIZED_CREDIT_CARD) {
          appliedPaymentGroups.push({
            type: PAYMENT_TYPE_CARD,
            paymentGroupId
          });
        } else if (paymentMethod === PAYMENT_METHOD_INVOICE_REQUEST) {
          appliedPaymentGroups.push({
            type: PAYMENT_TYPE_INVOICE,
            paymentGroupId
          });
        } else if (paymentMethod === PAYMENT_METHOD_ONLINE_PAYMENT_GROUP) {
          appliedPaymentGroups.push({
            type: paymentGroup.type,
            paymentGroupId
          });
        } else {
          appliedPaymentGroups.push({
            type: paymentMethod,
            paymentGroupId
          });
        }
      }
    }
    const payload = {
      payments: appliedPaymentGroups
    };

    action('checkoutCart', payload).then(response => {
      //Enable Place Order Button
      setPlaceOrderInitiated(false);
      if (response.ok === true) {
        const messages = {alertOrderNotPlacedPaymentDeclined, alertTechnicalProblemContactUs};
        const {delta: {orderRepository = {}} = {}} = response;
        const {orders = {}} = orderRepository;
        const order = Object.values(orders || {})[0] || {};
        const {paymentGroups = {}} = order;
        const payerAuthPaymentGroup = getPayerAuthPaymentGroup(paymentGroups);
        const responseUiIntervention = payerAuthPaymentGroup?.uiIntervention;
        if (responseUiIntervention) {
          payerAuthResponse(payerAuthPaymentGroup);
        } else {
          setInProgress(false);
          handleOrderSubmitSuccess(goToPage, response, action, messages);
        }
      } else {
        handleOrderSubmitFailure(action, goToPage, response);
      }
    });
  };

  const payerAuthResponse = async payerAuthPaymentGroup => {
    const appliedPaymentGroups = [];
    const {transientToken} = getState().payerAuthRepository;
    const {flexContext} = getState().flexMicroformRepository;
    const {deviceFingerprint} = getState().paymentMethodConfigRepository;
    const deleteField = [
      'captureContext',
      'captureContextCipherEncrypted',
      'captureContextCipherIv',
      'transientTokenJwt'
    ];
    var responseCustomData, customProperties, paymentGroupId, paymentDetails, detailsToUpdate, payload, messages;
    if (payerAuthPaymentGroup) {
      responseCustomData = payerAuthPaymentGroup.customPaymentProperties;
      Cardinal.continue(
        'cca',
        {
          AcsUrl: responseCustomData.acsUrl,
          Payload: responseCustomData.pareq
        },
        {
          OrderDetails: {
            TransactionId: responseCustomData.authenticationTransactionId
          }
        }
      );
      responseJwt = await returnJwt();
      if (responseJwt) {
        customProperties = {
          paymentType: PAYMENT_TYPE_CARD,
          captureContext: flexContext?.captureContext,
          captureContextCipherEncrypted: flexContext?.captureContextCipherEncrypted,
          captureContextCipherIv: flexContext?.captureContextCipherIv,
          ...(deviceFingerprint?.deviceFingerprintEnabled && deviceFingerprint?.deviceFingerprintData),
          transientTokenJwt: transientToken,
          authJwt: responseJwt
        };
        if (payerAuthPaymentGroup.savedCardId) {
          Object.keys(customProperties).forEach(key => {
            if (deleteField.includes(key)) {
              delete customProperties[key];
            }
          });
        }
        replaceSpecialCharacter(customProperties);
        paymentGroupId = payerAuthPaymentGroup.paymentGroupId;
        paymentDetails = paymentGroups[payerAuthPaymentGroup.paymentGroupId];
        const {...paymentDetailsToUpdate} = paymentDetails;
        paymentDetailsToUpdate.customProperties = customProperties;
        detailsToUpdate = {paymentGroupId: payerAuthPaymentGroup.paymentGroupId, cardCVV: '123', customProperties};
        await action('updateAppliedPayment', detailsToUpdate);
        appliedPaymentGroups.push({
          type: PAYMENT_TYPE_CARD,
          paymentGroupId
        });
        payload = {
          payments: appliedPaymentGroups
        };
        action('checkoutCart', payload).then(response => {
          setPlaceOrderInitiated(false);
          if (response.ok === true) {
            messages = {alertOrderNotPlacedPaymentDeclined, alertTechnicalProblemContactUs};
            handleOrderSubmitSuccess(goToPage, response, action, messages);
          } else {
            handleOrderSubmitFailure(action, goToPage, response);
          }
        });
      } else {
        action('notify', {level: 'error', message: headingPayment + ' ' + messageFailed});
      }
    }
  };

  const returnJwt = async () => {
    return new Promise(function (resolve, reject) {
      Cardinal.on('payments.validated', function (data, jwt) {
        if (data.ErrorNumber == 0) {
          resolve(jwt);
        } else {
          reject(false);
        }
      });
    });
  };

  //To invoke specific order method if scheduled order is enabled
  const selectedPlaceOrderMethod = () => {
    if (!isCurrentOrderScheduled) placeOrder();
    else placeScheduledOrder();
  };

  /**
   * Method to update email address and invoke place order
   * This will be called only for anonymous flow
   */
  const updateEmailAddressAndPlaceOrder = () => {
    const shippingGroupsPayload = [];
    for (const index of Object.keys(shippingGroups)) {
      const shippingGroup = shippingGroups[index] || {};
      const {shippingGroupId = ''} = shippingGroup;
      const shippingAddress = {
        email: guestEmailDetails.emailAddress
      };
      shippingGroupsPayload.push({shippingAddress, shippingGroupId});
    }
    const payload = {
      items: shippingGroupsPayload
    };
    action('updateCartShippingGroups', payload).then(response => {
      if (response.ok) {
        //Invoke Place order method
        selectedPlaceOrderMethod();
      } else {
        action('notify', {level: 'error', message: response.error.message});
      }
    });
  };

  /**
   * Method to handle place order.
   * Based on the user logged in status decides which method to be invoked.
   */
  const handlePlaceOrder = () => {
    setInProgress(true);
    setPlaceOrderInitiated(true);
    if (!authenticated) {
      updateEmailAddressAndPlaceOrder();
    } else {
      selectedPlaceOrderMethod();
    }
  };

  return (
    <Styled id="CheckoutPlaceOrderButton" css={css}>
      <div className="CheckoutPlaceOrderButton">
        <button
          type="button"
          onClick={handlePlaceOrder}
          disabled={inProgress || (!authenticated && !guestEmailDetails.isEmailValid)}
        >
          {inProgress ? processButtonName : submitButtonName}
        </button>
      </div>
    </Styled>
  );
};

export default connect(getComponentData)(IsvCheckoutPlaceOrderButton);
