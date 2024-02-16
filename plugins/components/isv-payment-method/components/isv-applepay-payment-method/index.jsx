/* eslint-disable no-inner-declarations */
import React, { useContext, useEffect, useState, useRef, useCallback } from 'react';
import RadioButton from '@oracle-cx-commerce/react-components/radio';
import CheckoutBillingAddress from '@oracle-cx-commerce/react-widgets/checkout/checkout-credit-card/components/checkout-billing-address';
import { useNavigator } from '@oracle-cx-commerce/react-components/link';
import { StoreContext, PaymentsContext } from '@oracle-cx-commerce/react-ui/contexts';
import {
  PAYMENT_STATE_INITIAL,
  PAYMENT_TYPE_PAY_IN_STORE,
  PAYMENT_TYPE_STORECREDIT,
  PAYMENT_TYPE_GIFTCARD,
  PAYMENT_TYPE_LOYALTYPOINTS,
  PAYMENT_TYPE_PAY_LATER,
  PAYMENT_TYPE_GENERIC
} from '@oracle-cx-commerce/commerce-utils/constants';
import Styled from '@oracle-cx-commerce/react-components/styled';
import css from './applePay.css';
import {
  deleteAppliedPaymentsByTypes,
  deleteAppliedPaymentsByIds,
  isPaymentDetailsComplete
} from '@oracle-cx-commerce/react-components/utils/payment';
import { getCurrentOrder, getGlobalContext, getCurrentProfileId } from '@oracle-cx-commerce/commerce-utils/selector';
import { replaceSpecialCharacter } from '../../../isv-common';
import ApplePay from './applePay';
import { getIpAddress, getAccountPurchaseHistory, getLineItemDetails, additionalFieldsMapper } from '../../../isv-common';

/**
 * Apple Pay allows to make payment using Apple Pay button
 * @param props
 */

const IsvApplePayPaymentMethod = props => {
  const {
    continueToPageAddress = '/checkout-review-order',
    paymentMethods = [],
    deviceFingerprint = {},
    labelApplePay = 'Apple Pay',
    headingPayment,
    messageFailed,
    messageEmptyCart,
    labelNoDefaultBillingAddressAvailable,
    isvSelectedGenericPayment,
    setIsvSelectedGenericPayment
  } = props;
  const store = useContext(StoreContext);
  const { action, getState } = store;
  const { priceInfo = {}, paymentGroups = {} } = getCurrentOrder(getState());
  const {
    payments = [],
    selectedPaymentType,
    addOrUpdatePaymentToContext,
    updateSelectedPaymentType
  } = useContext(PaymentsContext) || {};
  const [billingAddress, setBillingAddress] = useState({});
  const [isDisplayApplePay, setDisplayApplelePay] = useState(false);
  const { isPreview } = getGlobalContext(store.getState());
  let applePayConfiguration = [];

  if (typeof paymentMethods === 'object' && !Array.isArray(paymentMethods) && paymentMethods !== null) {
    applePayConfiguration = Object.entries(paymentMethods)
      .map(entry => entry[1])
      .filter(e => e.type == 'applepay');
  } else if (Array.isArray(paymentMethods)) {
    applePayConfiguration = paymentMethods.filter(paymentMethod => paymentMethod.type === 'applepay') || [];
  }
  useEffect(() => {
    setDisplayApplelePay(!!applePayConfiguration.length);
    return () => {
      setDisplayApplelePay(false);
    };
  }, [paymentMethods, applePayConfiguration]);

  //these payments can be combined with some other payment type like credit card, gift card etc.
  //so these payment type should not be deleted while applying new compatible payment type
  const compatiblePaymentTypes = [PAYMENT_TYPE_GIFTCARD, PAYMENT_TYPE_LOYALTYPOINTS, PAYMENT_TYPE_STORECREDIT];

  const [inProgress, setInProgress] = useState(false);
  const [isApplePayButtonHidden, setApplePayButtonHidden] = useState(true);
  const [applePay, setApplePay] = useState();
  const applePayRadioRef = useRef();
  const goToPage = useNavigator();
  const ERROR = 'error';
  /**
   * Navigates to the review order page
   */
  const goToReviewOrderPage = () => {
    const pageAddress = continueToPageAddress.split('/');
    const pageName = pageAddress.length > 1 ? pageAddress[1] : pageAddress[0];
    goToPage(pageName);
  };

  /**
   * Invokes apply payment action on the passed in payments payload.
   * @param paymentsToApply Array The payments to be applied
   */
  const applyPayments = paymentsToApply => {
    if (paymentsToApply.length > 0) {
      action('applyPayments', { items: paymentsToApply })
        .then(response => {
          if (response.ok) {
            const order = getCurrentOrder(getState());
            // If entered payment details is complete, navigate to the review order page
            if (isPaymentDetailsComplete(order)) {
              goToReviewOrderPage();
            }
          } else {
            action('notify', { level: ERROR, message: response.error.message });
            setInProgress(false);
          }
        })
        .catch(err => {
          action('notify', { level: ERROR, message: err.message });
          setInProgress(false);
        });
    } else if (isPaymentDetailsComplete(props)) {
      goToReviewOrderPage();
    }
  };

  /**
   * This method removes applied payment groups from order which are not applicable
   * @param payments {Array} The payments(from payment context) to be processed
   */
  const removeNotApplicablePaymentGroups = async payments => {
    try {
      let isError = false;
      if (payments.some(payment => payment.type === PAYMENT_TYPE_PAY_IN_STORE)) {
        //delete all payments as we are about to add in store payment and there is already non in store payment applied
        if (Object.values(paymentGroups).some(pGroup => pGroup.paymentMethod !== PAYMENT_TYPE_PAY_IN_STORE)) {
          const response = await deleteAppliedPaymentsByTypes(store);
          //remove error - pgid not available in current order
          if (!response.ok) {
            action('notify', { level: ERROR, message: response.error.message });
            isError = true;
            setInProgress(false);
          }
        }
      } else {
        //get payment group ids to be deleted
        const paymentGroupsToRemoved = Object.values(paymentGroups)
          .filter(
            pGroup =>
              pGroup.paymentState === PAYMENT_STATE_INITIAL &&
              !compatiblePaymentTypes.includes(pGroup.paymentMethod) &&
              !payments.some(payment => payment.paymentGroupId === pGroup.paymentGroupId)
          )
          .map(pGroup => pGroup.paymentGroupId);
        if (paymentGroupsToRemoved.length) {
          const response = await deleteAppliedPaymentsByIds(action, paymentGroupsToRemoved);
          if (!response.ok) {
            action('notify', { level: ERROR, message: response.error.message });
            isError = true;
            setInProgress(false);
          }
        }
      }
      return isError;
    } catch (error) {
      action('notify', { level: ERROR, message: error.message });
      let isError = true;
      setInProgress(false);
      return isError;
    }
  };

  /**
   * Processes the payments in the context
   * Updates the payment group if the payment in the context has an paymentGroupId
   * or calls the apply payments to apply the payment in the context.
   * @param payments Array The payments to be processed
   */
  const processPayments = useCallback(async payments => {
    const paymentsToApply = [];
    let isError = false;
    isError = await removeNotApplicablePaymentGroups(payments);
    if (isError) {
      setInProgress(false);
      return;
    }
    for (const payment of payments) {
      const { ...paymentDetails } = payment;
      paymentsToApply.push(paymentDetails);
    }
    if (!isError) {
      applyPayments(paymentsToApply);
    }
  }, []);

  async function createToken(tokenData) {
    const order = getCurrentOrder(getState());
    const profileId = getCurrentProfileId(getState());
    const additionalFields = await additionalFieldsMapper(profileId, action, order);
    const updatedPayments = {
      billingAddress: billingAddress,
      type: PAYMENT_TYPE_GENERIC,
      customProperties: {
        paymentToken: tokenData,
        paymentType: 'applepay',
        ...additionalFields,
        ...(deviceFingerprint?.deviceFingerprintEnabled && deviceFingerprint.deviceFingerprintData)
      }
    };

    replaceSpecialCharacter(updatedPayments.customProperties);
    addOrUpdatePaymentToContext(updatedPayments);
    let finalPayment = payments.filter(payment => payment.type !== PAYMENT_TYPE_GENERIC);
    finalPayment = [...finalPayment, updatedPayments];
    return finalPayment;
  }
  /**
   * Handler for continue to review order button
   */
  const continueToReviewOrder = async paymentData => {
    action('notifyClearAll');
    setInProgress(true);
    let paymentToProcess;
    paymentToProcess = await createToken(paymentData);
    if (paymentToProcess.length > 0) {
      processPayments(paymentToProcess);
    } else if (isPaymentDetailsComplete(props) || selectedPaymentType === PAYMENT_TYPE_PAY_LATER) {
      goToReviewOrderPage();
    }
  };

  const applePayCallback = async (method, validationUrl) => {
    let sessionData;
    switch (method) {
      case 'VALIDATION':
        await action('applePayValidationAction', { validationUrl, isPreview });
        sessionData = store.getState()?.applePayRepository.sessionData;
        break;
      case 'PAYMENT_AUTHORIZE':
        //handle payment data
        await continueToReviewOrder(validationUrl);
        break;
      case 'ERROR':
        action('notify', { level: ERROR, message: headingPayment + ' ' + messageFailed });
        break;
      default:
        console.log(method);
    }
    return sessionData;
  };

  //handles button click event
  const handleApplePayButtonClick = () => {
    if (!Object.keys(priceInfo).length) {
      return action('notify', { level: ERROR, message: messageEmptyCart });
    }
    if (!Object.keys(billingAddress).length) {
      return action('notify', { level: ERROR, message: labelNoDefaultBillingAddressAvailable });
    }
    const paymentData = {
      countryCode: billingAddress?.country,
      currencyCode: priceInfo.currencyCode,
      totalPrice: priceInfo.total.toString()
    };
    applePay.handleApplePay(paymentData);
  };

  useEffect(() => {
    if (isDisplayApplePay) {
      if (applePay) {
        applePay.destroy();
      }
      setApplePay(new ApplePay(applePayConfiguration[0].config, 'container-applepay', applePayCallback));
    }
  }, [isDisplayApplePay, billingAddress]);

  useEffect(() => {
    if (applePayRadioRef.current && (
      (isDisplayApplePay && !applePayRadioRef.current.checked && !isApplePayButtonHidden) ||
      (applePayRadioRef.current.checked && selectedPaymentType != PAYMENT_TYPE_GENERIC) ||
      !applePayRadioRef.current.checked
    )) {
      applePayRadioRef.current.checked = false;
      setApplePayButtonHidden(true)
      if (isvSelectedGenericPayment === 'applePay') {
        setIsvSelectedGenericPayment(null);
      }
    }
  }, [selectedPaymentType, isvSelectedGenericPayment]);

  const onApplePayPaymentSelection = useCallback(() => {
    if (selectedPaymentType != PAYMENT_TYPE_GENERIC) {
      updateSelectedPaymentType(PAYMENT_TYPE_GENERIC);
    }
    setApplePayButtonHidden(false);

    setIsvSelectedGenericPayment("applePay");
  }, [selectedPaymentType, isApplePayButtonHidden, applePayConfiguration]);

  if (!isDisplayApplePay) {
    return null;
  }

  return (
    <>
      <Styled id="apple-pay-styles" css={css}>
        <div className="CheckoutCreditCard CheckoutPaymentsGroup">
          <div className="CheckoutCreditCard__RadioButtonContainer">
            <RadioButton
              id="checkout-apple-pay"
              name="CheckoutPayments"
              disabled={!isDisplayApplePay}
              value={PAYMENT_TYPE_GENERIC}
              labelText={labelApplePay}
              onChange={onApplePayPaymentSelection}
              optionInputRef={applePayRadioRef}
            />
          </div>
          <div
            className={`CheckoutCreditCard__AddCardDetailsContainer ${isApplePayButtonHidden ? ' CheckoutCreditCard__AddCardDetailsContainer--hidden' : ''
              }`}
          >
            <div
              id="container-applepay"
              className="apple-pay-button-with-text apple-pay-button-white-with-text"
              onClick={handleApplePayButtonClick}
            ></div>
            <CheckoutBillingAddress {...props} onInput={({ billingAddress }) => setBillingAddress(billingAddress)} />
          </div>
        </div>
        {inProgress && (
          <div id="outerBlock">
            <div id="loader-inner">
              <div id="innerBlock"></div>
            </div>
          </div>
        )}
      </Styled>
    </>
  );
};

export default IsvApplePayPaymentMethod;
