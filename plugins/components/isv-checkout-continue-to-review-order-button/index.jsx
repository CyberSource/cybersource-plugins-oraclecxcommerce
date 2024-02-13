/* eslint-disable react-hooks/exhaustive-deps */
/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.
 */
import { useNavigator } from '@oracle-cx-commerce/react-components/link';
import React, { useContext, useState, useCallback, useEffect, useRef } from 'react';
import { PaymentsContext, StoreContext } from '@oracle-cx-commerce/react-ui/contexts';
import { connect } from '@oracle-cx-commerce/react-components/provider';
import { getCurrentOrder, getCurrentProfileId } from '@oracle-cx-commerce/commerce-utils/selector';
import Styled from '@oracle-cx-commerce/react-components/styled';
import { noop } from '@oracle-cx-commerce/utils/generic';
import {
  deleteAppliedPaymentsByTypes,
  deleteAppliedPaymentsByIds,
  getAmountRemainingPaymentGroup,
  isPaymentDetailsComplete,
  isZeroValueOrder
} from '@oracle-cx-commerce/react-components/utils/payment';
import {
  PAYMENT_STATE_INITIAL,
  PAYMENT_TYPE_PAY_IN_STORE,
  PAYMENT_TYPE_STORECREDIT,
  PAYMENT_TYPE_GIFTCARD,
  PAYMENT_TYPE_LOYALTYPOINTS,
  PAYMENT_TYPE_PAY_LATER,
  PAYMENT_TYPE_CARD
} from '@oracle-cx-commerce/commerce-utils/constants';
import PropTypes from 'prop-types';
import css from './styles.css';
import { createTokenAsync } from '../isv-payment-method/isv-payment-utility/flex-microform-api';
import { additionalFieldsMapper, replaceSpecialCharacter } from '../isv-common';
import { getGlobalContext } from '@oracle-cx-commerce/commerce-utils/selector';
import { DDC_URL_PATTERN } from '../constants';
import { getOptionalPayerAuthFields} from '../isv-common';
const ERROR = 'error';
let cardinalUrl;

/**
 * Widget for Continue To Review Order button, navigates to review order page on click after applying selected payment.
 * @param props
 */

const IsvCheckoutContinueToReviewOrderButton = props => {
  const { continueToPageAddress = '/checkout-review-order', actionContinueToReviewOrder, paymentGroups = {}, alertTechnicalProblemTryAgain, alertActionCompletedSuccessfully, messageFailed } = props;
  const { payments = [], selectedPaymentType, addOrUpdatePaymentToContext = noop } = useContext(PaymentsContext) || {};
  const store = useContext(StoreContext);
  const { action, getState } = store;
  //these payments can be combined with some other payment type like credit card, gift card etc.
  //so these payment type should not be deleted while applying new compatible payment type
  const compatiblePaymentTypes = [PAYMENT_TYPE_GIFTCARD, PAYMENT_TYPE_LOYALTYPOINTS, PAYMENT_TYPE_STORECREDIT];
  const [inProgress, setInProgress] = useState(false);
  const goToPage = useNavigator();
  const ddcFormRef = useRef(null);
  const ddcInputRef = useRef(null);
  const { isPreview } = getGlobalContext(store.getState());

  const order = getCurrentOrder(getState());
  let payerAuthEnabled = false,
    payerAuthConfiguration = [];
  const { paymentMethods = [] } = store.getState().paymentMethodConfigRepository || {};
  if (typeof paymentMethods === 'object' && !Array.isArray(paymentMethods) && paymentMethods !== null) {
    payerAuthConfiguration = Object.entries(paymentMethods)
      .map(entry => entry[1])
      .filter(paymentMethod => paymentMethod.type === 'card');
  } else if (Array.isArray(paymentMethods)) {
    payerAuthConfiguration = paymentMethods?.filter(paymentMethod => paymentMethod.type === 'card') || [];
  }
  payerAuthConfiguration.forEach(key => {
    payerAuthEnabled = key.config.payerAuthEnabled;
  });

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
      action('applyPayments', { items: paymentsToApply }).then(response => {
        if (response.ok) {
          const order = getCurrentOrder(getState());
          // If entered payment details is complete, navigate to the review order page
          if (isPaymentDetailsComplete(order)) {
            goToReviewOrderPage();
          }
          setInProgress(false);
        } else {
          action('notify', { level: ERROR, message: response.error.message });
          setInProgress(false);
        }
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
    let isError = false;
    if (payments.some(payment => payment.type === PAYMENT_TYPE_PAY_IN_STORE)) {
      //delete all payments as we are about to add in store payment and there is already non in store payment applied
      if (Object.values(paymentGroups).some(pGroup => pGroup.paymentMethod !== PAYMENT_TYPE_PAY_IN_STORE)) {
        const response = await deleteAppliedPaymentsByTypes(store);
        if (!response.ok) {
          action('notify', { level: ERROR, message: response.error.message });
          isError = true;
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
        }
      }
    }
    return isError;
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
      const { paymentGroupId, ...paymentDetails } = payment;
      const existingPaymentGroup = paymentGroups[paymentGroupId];
      if (paymentGroupId && existingPaymentGroup) {
        // Remove existing applied credit card payment group and reapply if
        // a different saved card has been selected, or
        // selection has been changed from saved card to a newly entered card(not saved) or
        // selection has been changed from newly entered card(not saved) to a saved card
        if (
          (payment.savedCardId &&
            existingPaymentGroup.savedCardId &&
            payment.savedCardId !== existingPaymentGroup.savedCardId) ||
          (!existingPaymentGroup.savedCardId && payment.savedCardId) ||
          (existingPaymentGroup.savedCardId && !payment.savedCardId)
        ) {
          const response = await action('deleteAppliedPayment', { paymentGroupId });
          if (response.ok) {
            paymentsToApply.push(paymentDetails);
          } else {
            action('notify', { level: ERROR, message: response.error.message });
            isError = true;
            setInProgress(false);
            break;
          }
        } else {
          await action('deleteAppliedPayment', { paymentGroupId });
          paymentsToApply.push(
            Object.fromEntries(Object.entries(paymentDetails).filter(arr => arr[0] != 'paymentGroupId'))
          );
        }
      } else {
        paymentsToApply.push(paymentDetails);
      }
    }
    if (!isError) {
      applyPayments(paymentsToApply);
    }
  }, []);

  async function createToken() {
    let transientToken = null;
    let referenceId = null;
    let finalPayment = payments,
      updatedPayments;
    const deleteField = ['creditCardNumberData', 'securityCodeData', 'flexMicroForm', 'number'];
    const cardPayment = (payments && payments.find(item => item.type === PAYMENT_TYPE_CARD)) || {};
    if (cardPayment) {

      const {
        expiryMonth,
        expiryYear,
        creditCardNumberData: { card } = {},
        flexMicroForm,
        customProperties
      } = cardPayment || {};
      const options = {
        expirationMonth: expiryMonth,
        expirationYear: expiryYear,
        type: card && card[0].cybsCardType
      };
      const { deviceFingerprint } = customProperties || {};
      const profileId = getCurrentProfileId(getState());

      const additionalFields = await additionalFieldsMapper(profileId, action, order);
      const updatedCustomProperties = {
        ...payerAuthEnabled && { ...getOptionalPayerAuthFields() },
        ...additionalFields,
        ...customProperties,
        ...(deviceFingerprint?.deviceFingerprintEnabled &&
          deviceFingerprint?.deviceFingerprintData)
      };

      //check for saved card return payment else create token for new card
      if (cardPayment.savedCardId) {
        if (payerAuthEnabled) {
          const setupResponse = await payerAuthSetup({ savedCardId: cardPayment.savedCardId, profileId });
          if (!setupResponse) return false;
          referenceId = setupResponse.referenceId;
          await callDeviceDataCollection(setupResponse);
        }
        cardPayment.customProperties = {
          ...updatedCustomProperties,
          ...referenceId && { referenceId }

        };
        replaceSpecialCharacter(cardPayment.customProperties);
        delete cardPayment.customProperties["deviceFingerprint"];
        finalPayment = payments.filter(payment => payment.type !== PAYMENT_TYPE_CARD);
        finalPayment = [...finalPayment, cardPayment];
      } else {
        transientToken = await createTokenAsync(flexMicroForm, options);
        if (payerAuthEnabled) {
          const setupResponse = await payerAuthSetup({ transientToken: transientToken.decoded.jti });
          if (!setupResponse) {
            return false;
          }
          referenceId = setupResponse.referenceId;
          await callDeviceDataCollection(setupResponse);
          store.getState().payerAuthRepository = { transientToken: transientToken.encoded, jti: transientToken.decoded.jti };
        }
        let cardNumber = transientToken.decoded.content.paymentInformation.card.number.bin + transientToken.decoded.content.paymentInformation.card.number.maskedValue.toLowerCase().substring(6);
        updatedPayments = {
          ...(payments && payments.find(item => item.type === PAYMENT_TYPE_CARD)),
          cardNumber: cardNumber,
          cardCVV: '',
          cardType: card && card[0].name,
          customProperties: {
            paymentType: PAYMENT_TYPE_CARD,
            transientTokenJwt: transientToken.encoded,
            ...updatedCustomProperties,
            ...referenceId && { referenceId }
          }
        };

        Object.keys(updatedPayments).forEach(key => {
          if (deleteField.includes(key)) {
            delete updatedPayments[key];
          }
        });
        delete updatedPayments.customProperties['deviceFingerprint'];
        replaceSpecialCharacter(updatedPayments.customProperties);
        addOrUpdatePaymentToContext(updatedPayments);
        finalPayment = payments.filter(payment => payment.type !== PAYMENT_TYPE_CARD);
        finalPayment = [...finalPayment, updatedPayments];
      }
    }
    return finalPayment;
  }

  /**
   * Handler for continue to review order button
   */
  const onContinueToReviewOrder = async () => {
    action('notifyClearAll');
    setInProgress(true);
    let paymentToProcess;
    if (selectedPaymentType === PAYMENT_TYPE_CARD) {
      paymentToProcess = await createToken();
    }
    if (paymentToProcess.length > 0) {
      processPayments(paymentToProcess);
    } else if (isPaymentDetailsComplete(props) || selectedPaymentType === PAYMENT_TYPE_PAY_LATER) {
      goToReviewOrderPage();
    }
  };

  /**
   * Returns true if Continue to review order button should be disabled
   * Disable continue to review order button, when
   * Continue to review order is in progress,
   * There are no payments in the payment context when
   * the order is not a zero value order
   * or there are no existing payment groups or there is a default payment group or appliedPaymentGroup
   */
  const isContinueToReviewOrderButtonDisabled = () => {
    const { creditCardNumberData, securityCodeData, savedCardId, cardCVV } =
      (payments && payments.find(item => item.type === PAYMENT_TYPE_CARD)) || {};
    const microFormIsValid =
      creditCardNumberData && creditCardNumberData.valid && securityCodeData && securityCodeData.valid;
    if (savedCardId || cardCVV?.length >= 3) {
      return false;
    } else {
      return selectedPaymentType === PAYMENT_TYPE_CARD
        ? inProgress ||
        (!isZeroValueOrder(props) &&
          (Object.keys(paymentGroups).length === 0 || getAmountRemainingPaymentGroup(props)) &&
          selectedPaymentType !== PAYMENT_TYPE_PAY_LATER &&
          !microFormIsValid)
        : inProgress ||
        (!isZeroValueOrder(props) &&
          (Object.keys(paymentGroups).length === 0 || getAmountRemainingPaymentGroup(props)) &&
          selectedPaymentType !== PAYMENT_TYPE_PAY_LATER &&
          payments.length === 0);
    }
  };

  async function payerAuthSetup(payload) {
    return new Promise((resolve) => {
      action('getPayerAuthSetupAction', { isPreview, setupPayload: { orderId: order.id, ...payload } }).then(response => {
        let payerAuthSetupData = false;
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
  async function callDeviceDataCollection(payerAuthSetupData) {
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
      <Styled id="CheckoutContinueToReviewOrderButton" css={css}>
        <div className="CheckoutContinueToReviewOrderButton">
          <button
            type="button"
            className="CheckoutContinueToReviewOrderButton__Button"
            disabled={isContinueToReviewOrderButtonDisabled()}
            onClick={onContinueToReviewOrder}
          >
            {actionContinueToReviewOrder}
          </button>
        </div>
      </Styled>
    </>
  );
};

IsvCheckoutContinueToReviewOrderButton.propTypes = {
  /**
   * The page address to redirect to on continue to review order click.
   */
  continueToPageAddress: PropTypes.string.isRequired,
  /**
   * The payment groups in the order
   */
  paymentGroups: PropTypes.objectOf(
    PropTypes.shape({
      /**
       * The payment group id
       */
      paymentGroupId: PropTypes.string.isRequired
    })
  )
};

IsvCheckoutContinueToReviewOrderButton.defaultProps = {
  paymentGroups: {}
};

export default connect(getCurrentOrder)(IsvCheckoutContinueToReviewOrderButton);
