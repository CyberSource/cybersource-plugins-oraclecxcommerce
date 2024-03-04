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
import css from './googlepay.css';
import {
  deleteAppliedPaymentsByTypes,
  deleteAppliedPaymentsByIds,
  isPaymentDetailsComplete
} from '@oracle-cx-commerce/react-components/utils/payment';
import { getCurrentOrder, getCurrentProfileId } from '@oracle-cx-commerce/commerce-utils/selector';
import { amdJsLoad } from '../../isv-payment-utility/script-loader';
import { replaceSpecialCharacter } from '../../../isv-common';
import GooglePay from './googlePay';
import { additionalFieldsMapper } from '../../../isv-common';
/**
 * @param props
 */
const IsvGooglePayPaymentMethod = props => {
  const {
    continueToPageAddress = '/checkout-review-order',
    paymentMethods = [],
    deviceFingerprint = {},
    labelGooglePay = 'Google Pay',
    headingPayment,
    messageFailed,
    labelError,
    messageEmptyCart,
    labelNoDefaultBillingAddressAvailable,
    textTotal,
    isvSelectedGenericPayment,
    setIsvSelectedGenericPayment
  } = props;
  const { action, getState } = useContext(StoreContext);
  const { priceInfo = {}, paymentGroups = {} } = getCurrentOrder(getState());
  const {
    payments = [],
    selectedPaymentType,
    addOrUpdatePaymentToContext,
    updateSelectedPaymentType
  } = useContext(PaymentsContext) || {};
  const [billingAddress, setBillingAddress] = useState({});
  const [isDisplayGooglePay, setDisplayGooglePay] = useState(false);
  const [googlePayConfiguration, setGooglePayConfiguration] = useState([]);

  //these payments can be combined with some other payment type like credit card, gift card etc.
  //so these payment type should not be deleted while applying new compatible payment type
  const compatiblePaymentTypes = [PAYMENT_TYPE_GIFTCARD, PAYMENT_TYPE_LOYALTYPOINTS, PAYMENT_TYPE_STORECREDIT];
  const [inProgress, setInProgress] = useState(false);
  const [googlePay, setGooglePay] = useState();
  const [isGooglePayButtonHidden, setGooglePayButtonHidden] = useState(true);
  const googlePayRadioRef = useRef();
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
            //setInProgress(false); //removed for hiding whole page till next page is loaded
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
      const { paymentGroupId, ...paymentDetails } = payment;
      paymentsToApply.push(paymentDetails);
    }
    if (!isError) {
      applyPayments(paymentsToApply);
    }
  }, []);

  async function createToken(data) {
    const order = getCurrentOrder(getState());
    const profileId = getCurrentProfileId(getState());
    const additionalFields = await additionalFieldsMapper(profileId, action, order);
    const updatedPayments = {
      billingAddress: billingAddress,
      type: PAYMENT_TYPE_GENERIC,
      customProperties: {
        paymentToken: data.paymentMethodData.tokenizationData.token,
        paymentType: 'googlepay',
        ...additionalFields,
        ...(deviceFingerprint?.deviceFingerprintEnabled && deviceFingerprint.deviceFingerprintData)
      }
    };
    //To replace '=' character with replaceCharacterRegex
    replaceSpecialCharacter(updatedPayments.customProperties);
    addOrUpdatePaymentToContext(updatedPayments);
    let finalPayment = payments.filter(payment => payment.type !== PAYMENT_TYPE_GENERIC);
    finalPayment = [...finalPayment, updatedPayments];

    return finalPayment;
  }

  /**
   * Handler for continue to review order button
   */
  const continueToReviewOrder = async data => {
    action('notifyClearAll');
    setInProgress(true);
    //check if googlepay status is canceled
    if (data?.transactionState === 'CANCELED') {
      action('notify', { level: ERROR, message: headingPayment + ' ' + labelError });
      setInProgress(false);
      return;
    }
    //check if there is any error in googlepay payment repsonse
    if (data?.transactionState === 'ERROR') {
      action('notify', { level: ERROR, message: headingPayment + ' ' + messageFailed });
      setInProgress(false);
      return;
    }
    let paymentToProcess;
    paymentToProcess = await createToken(data);
    if (paymentToProcess.length > 0) {
      processPayments(paymentToProcess);
    } else if (isPaymentDetailsComplete(props) || selectedPaymentType === PAYMENT_TYPE_PAY_LATER) {
      goToReviewOrderPage();
    }
  };

  const googlePayCallback = async (method, data) => {
    switch (method) {
      case 'GOOGLEPAY_BUTTON_CLICK':
        if (!Object.keys(priceInfo).length) {
          return action('notify', { level: ERROR, message: messageEmptyCart });
        }
        if (!Object.keys(billingAddress).length) {
          return action('notify', { level: ERROR, message: labelNoDefaultBillingAddressAvailable });
        }
        const paymentData = {
          countryCode: billingAddress?.country,
          currencyCode: priceInfo.currencyCode,
          totalPrice: priceInfo.total.toString(),
          totalPriceStatus: 'FINAL',
          totalPriceLabel: textTotal
        };
        googlePay.loadPaymentDataRequest(paymentData);
        break;
      case 'PAYMENT_AUTHORIZE':
        //handle payment data
        await continueToReviewOrder(data);
        break;
      default:
        console.log(method);
    }
  };

  useEffect(() => {
    if (googlePayConfiguration.length) {
      return;
    }
    let config = [];
    if (typeof paymentMethods === 'object' && !Array.isArray(paymentMethods) && paymentMethods !== null) {
      //convert to array
      config = Object.entries(paymentMethods)
        .map(entry => entry[1])
        .filter(e => e.type == 'googlepay');
    } else if (Array.isArray(paymentMethods)) {
      config = paymentMethods.filter(paymentMethod => paymentMethod.type === 'googlepay');
    }
    if (config.length) {
      setGooglePayConfiguration(config);
      //if config for googlepay is returned then show googlepay button
      setDisplayGooglePay(!!config.length || !!googlePayConfiguration.length);
    }
  }, [paymentMethods, googlePayConfiguration]);

  //load custom googlepay class object
  useEffect(() => {
    if (isDisplayGooglePay && Object.keys(billingAddress).length) {
      if (googlePay) {
        googlePay.destroy();
      }
      setGooglePay(new GooglePay(googlePayConfiguration[0].config, 'container-gpay', googlePayCallback));
    }
  }, [isDisplayGooglePay, billingAddress]);

  //load googlepay script in html
  useEffect(() => {
    if (googlePay && isDisplayGooglePay) {
      amdJsLoad(googlePayConfiguration[0].config.googlePaySdkUrl, 'GPayScript')
        .then(() => {
          googlePay.loadGooglePay(googlePayCallback);
        })
        .catch(err => {
          console.log(err);
        });
    }
  }, [isDisplayGooglePay, googlePay]);

  //hide googlepay button if googlepay radio button is not checked
  useEffect(() => {
    if (
      googlePayRadioRef.current &&
      ((isDisplayGooglePay && !googlePayRadioRef.current.checked && !isGooglePayButtonHidden) ||
        (googlePayRadioRef.current.checked && selectedPaymentType != PAYMENT_TYPE_GENERIC) ||
        !googlePayRadioRef.current.checked
      )
    ) {
      googlePayRadioRef.current.checked = false;
      setGooglePayButtonHidden(true);

      //check if selected payment is googlePay
      if (isvSelectedGenericPayment === 'googlePay') {
        setIsvSelectedGenericPayment(null);
      }
    }
  }, [selectedPaymentType, isvSelectedGenericPayment]);

  //set selectedPayment as generic
  const onGooglePayPaymentSelection = useCallback(() => {
    if (selectedPaymentType != PAYMENT_TYPE_GENERIC) {
      updateSelectedPaymentType(PAYMENT_TYPE_GENERIC);
    }
    setGooglePayButtonHidden(false);
    setIsvSelectedGenericPayment("googlePay");
  }, [selectedPaymentType, isGooglePayButtonHidden]);

  if (!isDisplayGooglePay) {
    return null;
  }

  return (
    <>
      <Styled id="googlePayStyles" css={css}>
        <div className="CheckoutCreditCard CheckoutPaymentsGroup">
          <div className="CheckoutCreditCard__RadioButtonContainer">
            <RadioButton
              id={`checkout-googlePay`}
              name="CheckoutPayments"
              disabled={!isDisplayGooglePay}
              value={PAYMENT_TYPE_GENERIC}
              labelText={labelGooglePay}
              onChange={onGooglePayPaymentSelection}
              optionInputRef={googlePayRadioRef}
            />
          </div>
          <div
            className={`CheckoutCreditCard__AddCardDetailsContainer ${isGooglePayButtonHidden ? ' CheckoutCreditCard__AddCardDetailsContainer--hidden' : ''
              }`}
          >
            <div id="container-gpay"></div>
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

export default IsvGooglePayPaymentMethod;
