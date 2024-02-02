/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.
 */
import { StoreContext, OrderContext, ContainerContext, PaymentsContext } from '@oracle-cx-commerce/react-ui/contexts';
import React, { useState, useContext, useEffect, useRef } from 'react';
import Styled from '@oracle-cx-commerce/react-components/styled';
import css from '@oracle-cx-commerce/react-widgets/checkout/checkout-place-order-button/styles.css';
import {
  handleOrderSubmitSuccess,
  handleOrderSubmitFailure
} from '@oracle-cx-commerce/react-widgets/checkout/checkout-place-order-button/utils';
import { connect } from '@oracle-cx-commerce/react-components/provider';
import { getComponentData } from '@oracle-cx-commerce/react-widgets/checkout/checkout-place-order-button/selectors';
import {
  PAYMENT_METHOD_TOKENIZED_CREDIT_CARD,
  PAYMENT_METHOD_CREDIT_CARD,
  PAYMENT_METHOD_INVOICE_REQUEST,
  PAYMENT_METHOD_ONLINE_PAYMENT_GROUP,
  PAYMENT_TYPE_INVOICE,
  PAYMENT_TYPE_CARD,
} from '@oracle-cx-commerce/commerce-utils/constants';
import { useNavigator } from '@oracle-cx-commerce/react-components/link';
import { noop, formatDate } from '@oracle-cx-commerce/utils/generic';
import { getPayerAuthPaymentGroup } from '@oracle-cx-commerce/react-components/utils/payment';
import { replaceSpecialCharacter } from '../isv-common';
import payerAuthCss from './styles.css';
import { getGlobalContext, getCurrentOrder, getCurrentProfileId } from '@oracle-cx-commerce/commerce-utils/selector';
import { CHANNEL } from '../constants';
import { DDC_URL_PATTERN, RETURN_URL } from '../constants';
import { getIpAddress, getOptionalPayerAuthFields, additionalFieldsMapper } from '../isv-common';

let authTransactionId;
const ERROR = 'error';
let cardinalUrl;
let payerAuthSetupData = false;
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
    messageFailed,
    alertActionCompletedSuccessfully,
    continueToPageAddress = '/checkout-payment'
  } = props;
  //context
  const { paymentGroups = {}, shippingGroups = {} } = useContext(OrderContext);
  const { guestEmailDetails = {}, setPlaceOrderInitiated = noop } = useContext(ContainerContext);
  const { getState, action } = useContext(StoreContext);
  //selector data
  const { authenticated, isCurrentOrderScheduled = false } = props;
  const submitButtonName = isCurrentOrderScheduled ? buttonScheduledOrder : buttonPlaceOrder;
  const processButtonName = isCurrentOrderScheduled ? buttonSchedulingOrder : buttonPlacingOrder;
  const [inProgress, setInProgress] = useState(false);
  const goToPage = useNavigator();
  const ddcFormRef = useRef(null);
  const ddcInputRef = useRef(null);
  const stepUpFormRef = useRef(null);
  const stepUpInputRef = useRef(null);
  const [height, setHeight] = useState(400);
  const [width, setWidth] = useState(400);
  const order = getCurrentOrder(getState());
  const { isPreview } = getGlobalContext(getState());
  const channel = isPreview ? CHANNEL.PREVIEW : CHANNEL.STOREFRONT;
  const isWindow = typeof window !== "undefined";
  const [ipAddress, setIpAddress] = useState('');
  const windowSizeMap = {
    '01': { width: 250, height: 400 },
    '02': { width: 390, height: 400 },
    '03': { width: 500, height: 600 },
    '04': { width: 600, height: 400 },
    '05': { width: isWindow ? window.innerWidth : 400, height: isWindow ? window.innerHeight : 400 },
    '06': { width: 400, height: 400 }
  };
  const { payments = [] } = useContext(PaymentsContext) || {};
  const cardPayment = (payments && payments.find(item => item.type === PAYMENT_TYPE_CARD)) || {};

  const goToPaymentPage = () => {
    const pageAddress = continueToPageAddress.split('/');
    const pageName = pageAddress.length > 1 ? pageAddress[1] : pageAddress[0];
    goToPage(pageName);
  };


  /**
   * Method to invoke when current order is converted(placed) as scheduled order
   */
  const placeScheduledOrder = () => {
    const { scheduleInfo } = props;
    const schedulePayload = {
      ...scheduleInfo,
      startDate: formatDate(scheduleInfo.startDate),
      endDate: formatDate(scheduleInfo.endDate)
    };
    const { daysInMonth, ...sceduleInfoFinal } = schedulePayload.schedule;
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
          action('saveComponentData', { ...payload });
        } catch (error) {
          console.error(error);
        }
        const messages = { alertOrderNotPlacedPaymentDeclined, alertTechnicalProblemContactUs };
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
        const { paymentGroupId, paymentMethod } = paymentGroup;
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
        const messages = { alertOrderNotPlacedPaymentDeclined, alertTechnicalProblemContactUs };
        const { delta: { orderRepository = {} } = {} } = response;
        const { orders = {} } = orderRepository;
        const order = Object.values(orders || {})[0] || {};
        const { paymentGroups = {} } = order;
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
    let transientToken = '';
    const scaDetails = payerAuthPaymentGroup?.customPaymentProperties || {};
    if (scaDetails.scaRequired) {
      return handleSca(payerAuthPaymentGroup);
    }
    if (!payerAuthPaymentGroup.savedCardId) {
      transientToken = getState().payerAuthRepository?.transientToken;
    }
    const { flexContext } = getState().flexMicroformRepository;
    const { deviceFingerprint } = getState().paymentMethodConfigRepository;
    const deleteField = [
      'captureContext',
      'captureContextCipherEncrypted',
      'captureContextCipherIv',
      'transientTokenJwt'
    ];
    let customProperties, paymentGroupId, paymentDetails, detailsToUpdate, payload, messages;
    if (payerAuthPaymentGroup) {
      const stepUpDetails = payerAuthPaymentGroup.customPaymentProperties || {};
      if (stepUpInputRef.current && stepUpFormRef.current) {
        stepUpFormRef.current.action = stepUpDetails?.stepUpUrl;
        stepUpInputRef.current.value = stepUpDetails?.accessToken;
      }
      try {
        const decodedPareqValue = isWindow && window.atob(stepUpDetails.pareq);
        const pareqJson = JSON.parse(decodedPareqValue);
        const challengeWindowSize = pareqJson.challengeWindowSize;
        const { width, height } = windowSizeMap[challengeWindowSize] || windowSizeMap['06'];
        setWidth(width);
        setHeight(height);
      } catch (error) {
        console.log(error);
      }

      authTransactionId = await payerAuthValidation();
      if (authTransactionId) {
        const profileId = getCurrentProfileId(getState());
        const additionalFields = await additionalFieldsMapper(profileId, action, order);
        customProperties = {
          paymentType: PAYMENT_TYPE_CARD,
          captureContext: flexContext?.captureContext,
          captureContextCipherEncrypted: flexContext?.captureContextCipherEncrypted,
          captureContextCipherIv: flexContext?.captureContextCipherIv,
          ...(deviceFingerprint?.deviceFingerprintEnabled && deviceFingerprint?.deviceFingerprintData),
          transientTokenJwt: transientToken,
          ...additionalFields,
          authenticationTransactionId: authTransactionId,
          ...payerAuthPaymentGroup.customPaymentProperties?.pauseRequestId && { pauseRequestId: payerAuthPaymentGroup.customPaymentProperties.pauseRequestId },
          ...payerAuthPaymentGroup.customPaymentProperties?.challengeCode === '04' && { challengeCode: payerAuthPaymentGroup.customPaymentProperties?.challengeCode }
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
        const { ...paymentDetailsToUpdate } = paymentDetails;
        paymentDetailsToUpdate.customProperties = customProperties;
        detailsToUpdate = { paymentGroupId: payerAuthPaymentGroup.paymentGroupId, cardCVV: '123', customProperties };
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
            const { delta: { orderRepository = {} } = {} } = response;
            const { orders = {} } = orderRepository;
            const order = Object.values(orders || {})[0] || {};
            const { paymentGroups = {} } = order;
            const payerAuthPaymentGroups = getPayerAuthPaymentGroup(paymentGroups);
            const scaDetails = payerAuthPaymentGroups?.customPaymentProperties || {};
            if (scaDetails.scaRequired) {
              handleSca(payerAuthPaymentGroups);
            }
            else {
              messages = { alertOrderNotPlacedPaymentDeclined, alertTechnicalProblemContactUs };
              handleOrderSubmitSuccess(goToPage, response, action, messages);
            }
          } else {
            handleOrderSubmitFailure(action, goToPage, response);
          }
        });
      } else {
        action('notify', { level: 'error', message: headingPayment + ' ' + messageFailed });
      }
    }
  };
  async function handleSca(payerAuthPaymentGroup) {
    const profileId = getCurrentProfileId(getState());
    const additionalFields = await additionalFieldsMapper(profileId, action, order);
    let setupResponse;
    const { deviceFingerprint } = getState().paymentMethodConfigRepository;
    const updatedCustomProperties = {
      ...cardPayment.customProperties,
      returnUrl: window.location.origin + RETURN_URL,
      challengeCode: '04',
      ...additionalFields,
      ...(deviceFingerprint?.deviceFingerprintEnabled &&
        deviceFingerprint?.deviceFingerprintData),
      ...{ ...getOptionalPayerAuthFields(), ipAddress: ipAddress || await getIpAddress(true) }
    };

    if (payerAuthPaymentGroup.savedCardId) {
      const profileId = getCurrentProfileId(getState());
      setupResponse = await payerAuthSetup({ savedCardId: payerAuthPaymentGroup.savedCardId, profileId });
      if (setupResponse.referenceId) {
        cardPayment.customProperties = {
          ...updatedCustomProperties,
          referenceId: setupResponse.referenceId,
        }
      }

    }
    else {
      const token = getState().payerAuthRepository?.jti;
      const { flexContext } = getState().flexMicroformRepository;
      setupResponse = await payerAuthSetup({ transientToken: token });
      if (setupResponse.referenceId) {
        cardPayment.customProperties = {
          ...updatedCustomProperties,
          referenceId: setupResponse.referenceId,
          transientTokenJwt: getState().payerAuthRepository?.transientToken,
          paymentType: PAYMENT_TYPE_CARD,
          captureContext: flexContext?.captureContext,
          captureContextCipherEncrypted: flexContext?.captureContextCipherEncrypted,
          captureContextCipherIv: flexContext?.captureContextCipherIv,
        }
      }
    }

    await callDeviceDataCollection();
    replaceSpecialCharacter(cardPayment.customProperties);

    let paymentGroupId = payerAuthPaymentGroup.paymentGroupId;
    let paymentDetails = paymentGroups[payerAuthPaymentGroup.paymentGroupId];
    const { ...paymentDetailsToUpdate } = paymentDetails;
    paymentDetailsToUpdate.customProperties = cardPayment.customProperties;
    let detailsToUpdate = { paymentGroupId: payerAuthPaymentGroup.paymentGroupId, customProperties: cardPayment.customProperties, cardCVV: '123' };
    await action('updateAppliedPayment', detailsToUpdate);
    const appliedPaymentGroups = [];

    appliedPaymentGroups.push({
      type: PAYMENT_TYPE_CARD,
      paymentGroupId
    });
    let payload = {
      payments: appliedPaymentGroups
    };

    action('checkoutCart', payload).then(response => {
      //Enable Place Order Button
      setPlaceOrderInitiated(false);
      if (response.ok === true) {
        const messages = { alertOrderNotPlacedPaymentDeclined, alertTechnicalProblemContactUs };
        const { delta: { orderRepository = {} } = {} } = response;
        const { orders = {} } = orderRepository;
        const order = Object.values(orders || {})[0] || {};
        const { paymentGroups = {} } = order;
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
  }


  async function payerAuthSetup(payload) {
    return new Promise((resolve) => {
      action('getPayerAuthSetupAction', { isPreview, setupPayload: { orderId: order.id, ...payload } }).then(response => {
        if (response.ok) {
          const data = response.delta.payerAuthSetupRepository || {};
          cardinalUrl = data.deviceDataCollectionUrl.match(DDC_URL_PATTERN)[1];
          payerAuthSetupData = data || false;
        } else {
          action('notify', { level: ERROR, message: response.error.message });
          setInProgress(false);
        }
        resolve(payerAuthSetupData);
      });
    });
  };
  async function callDeviceDataCollection() {
    return new Promise((resolve) => {
      if (!ddcInputRef.current || !ddcFormRef.current) {
        return;
      }
      ddcFormRef.current.action = payerAuthSetupData.deviceDataCollectionUrl || '';
      ddcInputRef.current.value = payerAuthSetupData.accessToken || '';
      ddcFormRef.current.submit();
      if (typeof window !== 'undefined') {
        window.addEventListener('message', (event) => {
          if (event.origin === cardinalUrl) {
            let data = JSON.parse(event.data);
            if (data != undefined && data.Status) {
              console.log(alertActionCompletedSuccessfully);
              resolve();
            }
            console.log(alertActionCompletedSuccessfully, data);
          };
        }, false);
      };

    });
  }

  async function payerAuthValidation() {
    return new Promise((resolve) => {
      stepUpFormRef.current.submit();
      let frame = document.querySelector('.Payer_Auth_Form');
      let overlay = document.querySelector('.Overlay');
      frame.style.display = 'block';
      overlay.style.display = 'block';
      if (typeof window !== 'undefined') {
        window.addEventListener('message', (event) => {
          let type = event.data.messageType;
          if (type === 'transactionValidation') {
            if (event.data.message != undefined) {
              frame.style.display = 'none';
              overlay.style.display = 'none';
              console.log(alertActionCompletedSuccessfully);
              resolve(JSON.parse(event.data.message));
            };
          };
        }, false);
      }
      else {
        resolve(false);
      }
    })
  }


  useEffect(() => {
    getIpAddress()
      .then(setIpAddress)
      .catch(error => {
        console.error("IPAddress: " + messageFailed)
      });
  }, []);

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
      const { shippingGroupId = '' } = shippingGroup;
      const shippingAddress = {
        email: guestEmailDetails.emailAddress
      };
      shippingGroupsPayload.push({ shippingAddress, shippingGroupId });
    }
    const payload = {
      items: shippingGroupsPayload
    };
    action('updateCartShippingGroups', payload).then(response => {
      if (response.ok) {
        //Invoke Place order method
        selectedPlaceOrderMethod();
      } else {
        action('notify', { level: 'error', message: response.error.message });
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

  useEffect(() => {
    if (self != top) {
      top.location = encodeURI(self.location);
    }
  }, []);

  return (
    <>
      <iframe name="cardinalCollectionIframe" height="10" width="10" sandbox style={{ display: "none" }} />
      <form ref={ddcFormRef} id="cardinalCollectionForm" target="cardinalCollectionIframe" name="deviceData" method="POST">
        <input ref={ddcInputRef} type="hidden" name="JWT" />
      </form>
      <>
        <div className="Overlay">
          <Styled id="iframe" css={payerAuthCss}>
            <div className="Payer_Auth_Form" >
              <iframe name="stepUpIframe" height={height} width={width} sandbox></iframe>
              <form ref={stepUpFormRef} id="stepUpForm" target="stepUpIframe" method="post" >
                <input ref={stepUpInputRef} type="hidden" name="JWT" />
                <input type="hidden" name="MD" value={`orderId=${order.id},channel=${channel}`} />
              </form>
            </div>
          </Styled>
        </div>
      </>
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
    </>
  );
};

export default connect(getComponentData)(IsvCheckoutPlaceOrderButton);