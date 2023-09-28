/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-inner-declarations */
/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.
 */
 import React, { useCallback, useState, useEffect, useRef, useMemo } from 'react';
 import {
   getCardType,
   validateCardNumber,
   validateCVV,
   validateExpiryMonth,
   validateExpiryYear,
   validateRequiredField
 } from '@oracle-cx-commerce/react-components/utils/payment';
 import Styled from '@oracle-cx-commerce/react-components/styled';
 import css from '@oracle-cx-commerce/react-widgets/checkout/checkout-credit-card/components/checkout-card-details/styles.css';
 import WarningIcon from '@oracle-cx-commerce/react-components/icons/warning';
 import { t, noop } from '@oracle-cx-commerce/utils/generic';
 import { getCardDetailsData } from '@oracle-cx-commerce/react-widgets/checkout/checkout-credit-card/components/checkout-card-details/selectors';
 import { connect } from '@oracle-cx-commerce/react-components/provider';
 import { PAYMENT_TYPE_CARD } from '@oracle-cx-commerce/commerce-utils/constants';
 import CardTypes from '@oracle-cx-commerce/react-widgets/checkout/checkout-credit-card/components/checkout-card-details/card-types';
 import Microform from '../../isv-payment-utility/flex-microform';
 import { amdJsLoad } from '../../isv-payment-utility/script-loader';
 
 /**
  * Widget for card details.
  * Provides option for entering card details
  */
 const IsvCheckoutCardDetails = props => {
   const {
     appliedPaymentGroupCardDetails = {},
     cardTypes,
     id,
     selectedPaymentType,
     isPaymentDisabled = false,
     labelCardCVV,
     labelCardNumber,
     labelExpiryDate,
     labelExpiryMonth,
     labelExpiryYear,
     labelNameOnCard,
     onInput = noop,
     textFieldInvalid,
     textRequiredField,
     useAnotherCard = true,
     flexContext,
     deviceFingerprint,
     flexSdkUrl
   } = props;
   const [selectedCardType, setSelectedCardType] = useState({});
   const [cardTypeNotEnabled, setCardTypeNotEnabled] = useState(false);
   const cardTypeInvalid = t(textFieldInvalid, { fieldName: labelCardNumber });
   const [cardDetails, setCardDetails] = useState({
     creditCardNumberData: {},
     securityCodeData: {},
     flexMicroForm: {},
     number: '',
     cardCVV: '',
     expiryMonth: '',
     expiryYear: '',
     nameOnCard: '',
     customProperties: {
       ...flexContext,
       deviceFingerprint
     }
   });
   const [flexMicroform, setFlexMicroform] = useState();
   const cvvElementRef = useRef();
   const expiryMonthElementRef = useRef();
   const expiryYearElementRef = useRef();
   const cardContainerElementRef = useRef();
   // The card number from the applied payment group for the credit card
   const appliedCardNumber = appliedPaymentGroupCardDetails.number
     ? appliedPaymentGroupCardDetails.number.replace(/x/g, '*')
     : undefined;
   const validators = useMemo(
     () => ({
       number: number => {
         let validationMessage = '';
         const rawCardNumber = number.replace(/\s+/g, '');
         // do not validate if the card number is set to the value from the applied payment group
         if (appliedCardNumber !== rawCardNumber) {
           validationMessage = validateCardNumber(
             rawCardNumber,
             selectedCardType.length || getCardType(rawCardNumber, cardTypes).length,
             {
               messageCardNumberInvalid: t(textFieldInvalid, { fieldName: labelCardNumber }),
               messageCardNumberRequired: textRequiredField
             }
           );
         }
         return validationMessage;
       },
       cardCVV: cardCVV =>
         validateCVV(cardCVV, selectedCardType.cvvLength, {
           messageCardCVVInvalid: t(textFieldInvalid, { fieldName: labelCardCVV }),
           messageCardCVVRequired: textRequiredField
         }),
       expiryMonth: expiryMonth =>
         validateExpiryMonth(expiryMonth, cardDetails.expiryYear, {
           messageExpiryDateInvalid: t(textFieldInvalid, { fieldName: labelExpiryDate }),
           messageExpiryDateRequired: textRequiredField
         }),
       expiryYear: expiryYear =>
         validateExpiryYear(expiryYear, {
           messageExpiryDateInvalid: t(textFieldInvalid, { fieldName: labelExpiryDate }),
           messageExpiryDateRequired: textRequiredField
         }),
       nameOnCard: nameOnCard => validateRequiredField(nameOnCard, textRequiredField)
     }),
     [
       appliedCardNumber,
       cardDetails.expiryYear,
       cardTypes,
       labelCardCVV,
       labelCardNumber,
       labelExpiryDate,
       selectedCardType.cvvLength,
       selectedCardType.length,
       textFieldInvalid,
       textRequiredField
     ]
   );
 
   /**
    * Returns the error message sibling element
    * @param {Object} The element
    * @param {function} The function to validate element
    */
   const getErrorMessageElement = element => {
     const fieldName = element.name;
     const errorMessageContainer =
       fieldName === 'expiryMonth' || fieldName === 'expiryYear' || fieldName === 'cardCVV'
         ? element.parentElement.nextElementSibling.querySelector('.CheckoutCardDetails__ErrorMessage')
         : element.nextElementSibling.querySelector('.CheckoutCardDetails__ErrorMessage');
     return errorMessageContainer;
   };
   /**
    * Validate the element to set any custom errors
    * @param {Object} The element to validate
    * @param {function} The function to validate element
    */
   const setElementValidity = useCallback((element, validator) => {
     element.setCustomValidity('');
     element.classList.remove('CheckoutCardDetails__Invalid');
     if (validator) {
       element.setCustomValidity(validator(element.value));
     }
     if (element.validationMessage) {
       element.classList.add('CheckoutCardDetails__Invalid');
     }
     const errorMessageContainer = getErrorMessageElement(element);
     if (errorMessageContainer) {
       errorMessageContainer.textContent = element.validationMessage;
     }
   }, []);
   // If card payment is disabled reset card details
   useEffect(() => {
     if (isPaymentDisabled) {
       // clear all invalid messages since the fields will be disabled
       const cardContainerElement = cardContainerElementRef.current;
       if (cardContainerElement) {
         const invalidElements = cardContainerElement.querySelectorAll('.CheckoutCardDetails__Invalid');
         invalidElements.forEach(element => {
           element.classList.remove('CheckoutCardDetails__Invalid');
           element.setCustomValidity('');
           const errorMessageContainer = getErrorMessageElement(element);
           if (errorMessageContainer) {
             errorMessageContainer.textContent = '';
           }
         });
       }
       // reset card details to empty if any of the values is not empty
       if (Object.values(cardDetails).some(cardDetail => cardDetail !== '')) {
         setCardDetails({
           number: '',
           cardCVV: '',
           expiryMonth: '',
           expiryYear: '',
           nameOnCard: ''
         });
       }
     }
   }, [isPaymentDisabled, cardDetails]);
   // validate CVV when card type changes
   useEffect(() => {
     const cvvElement = cvvElementRef.current;
     if (cvvElement && cvvElement.value) {
       setElementValidity(cvvElement, validators[cvvElement.name]);
     }
   }, [selectedCardType, setElementValidity, validators]);
   // reset cvv when a different payment type or saved card is selected
   useEffect(() => {
     if (cardDetails.cardCVV !== '' && (!useAnotherCard || selectedPaymentType !== PAYMENT_TYPE_CARD)) {
       setCardDetails(cardDetails => {
         return { ...cardDetails, cardCVV: '' };
       });
     }
   }, [useAnotherCard, selectedPaymentType, cardDetails.cardCVV]);
   // Call onInput callback to update the state in the parent component
   useEffect(() => {
     if (useAnotherCard) {
       const currentYear = new Date().getUTCFullYear().toString();
       onInput({
         ...cardDetails,
         expiryYear: cardDetails.expiryYear ? `${currentYear.substring(0, 2)}${cardDetails.expiryYear}` : '',
         cardType: selectedCardType.repositoryId ? selectedCardType.repositoryId : '',
         type: PAYMENT_TYPE_CARD
       });
     }
   }, [cardDetails, onInput, selectedCardType.repositoryId, useAnotherCard]);
   // Validate expiry month when expiry year changes
   useEffect(() => {
     const expiryMonthElement = expiryMonthElementRef.current;
     const expiryYearElement = expiryYearElementRef.current;
     // if year is valid and expiry month is not empty validate month
     if (
       expiryYearElement &&
       !validators[expiryYearElement.name](cardDetails.expiryYear) &&
       expiryMonthElement &&
       expiryMonthElement.value
     ) {
       setElementValidity(expiryMonthElement, validators[expiryMonthElement.name]);
     }
   }, [cardDetails.expiryYear, setElementValidity, validators]);
   // Set the appliedCreditCardPaymentGroup card details to the state
   useEffect(() => {
     if (appliedCardNumber && cardTypes) {
       setSelectedCardType(cardTypes[appliedPaymentGroupCardDetails.cardType]);
       setCardDetails({
         number: appliedCardNumber,
         cardCVV: '',
         nameOnCard: appliedPaymentGroupCardDetails.nameOnCard,
         expiryMonth: appliedPaymentGroupCardDetails.expiryMonth,
         expiryYear: appliedPaymentGroupCardDetails.expiryYear.substr(-2)
       });
     }
   }, [
     appliedCardNumber,
     appliedPaymentGroupCardDetails.cardType,
     appliedPaymentGroupCardDetails.nameOnCard,
     appliedPaymentGroupCardDetails.expiryMonth,
     appliedPaymentGroupCardDetails.expiryYear,
     cardTypes
   ]);
   /**
    * Updates state
    * @param {fieldName} String The fieldName to update
    * @param {fieldValue} String The fieldValue
    */
   const updateState = (fieldName, fieldValue) => {
     setCardDetails(cardDetails => {
       const cardDetail = {
         ...cardDetails,
         [fieldName]: fieldValue
       };
       return cardDetail;
     });
   };
   /**
    * Called when input changes to set the state.
    * @param {Object} event The event object
    */
   const onInputChange = event => {
     const element = event.target;
     const fieldValue = element.value;
     const fieldName = element.name;
     const regex = /^[0-9]+$/;
     // set custom validity to determine if the element is valid
     // required to update payment context
     element.setCustomValidity(validators[fieldName](fieldValue));
     if (fieldName === 'nameOnCard' || fieldValue === '' || regex.test(fieldValue)) {
       updateState(fieldName, fieldValue);
     }
   };
   /**
    * Updates state as card number changes.
    * @param {Object} event The event object
    */
   const onCardNumberChange = data => {
    const cardData = data.card && data.card[0];
    setCardTypeNotEnabled(true);
    if (cardTypes) {
      const enabledCardTypes = Object.keys(cardTypes);
      for (const card of enabledCardTypes) {
        if (cardTypes[card].code === cardData?.cybsCardType) {
          setCardTypeNotEnabled(false);
          updateState('creditCardNumberData', data);
          setSelectedCardType(cardTypes[card].value);
          break;
        }
        else {
          setSelectedCardType('');
          updateState('creditCardNumberData', null);
        }
      }
    }
  }
   const onSecurityCodeChange = data => {
     updateState('securityCodeData', data);
   };
   /** Validates expiry month or year element on blur
    *  @param {Object} element The element to validate
    */
   const validateExpiryMonthYear = element => {
     if (
       element &&
       element.current &&
       (element.current.value || element.current.classList.contains('CheckoutCardDetails__Invalid'))
     ) {
       setElementValidity(element.current, validators[element.current.name]);
     }
   };
   /**
    * Validates input on element blur
    * @param {Object} event The event object
    */
   const validateInput = event => {
     const element = event.target;
     const validator = validators[element.name];
     if (validator) {
       setElementValidity(element, validator);
     }
     if (!element.validationMessage) {
       if (element.name === 'expiryMonth') {
         validateExpiryMonthYear(expiryYearElementRef);
       } else if (element.name === 'expiryYear') {
         validateExpiryMonthYear(expiryMonthElementRef);
       }
     }
   };
   const creditCardNumberFieldName = useMemo(() => `cardNumber-${id}`, [id]);
   const cvvNumberFieldName = useMemo(() => `cardCVV-${id}`, [id]);
   useEffect(() => {
     if (creditCardNumberFieldName && cvvNumberFieldName) {
       const microform = new Microform({
         sdkUrl: flexSdkUrl,
         securityCodeContainer: `#${cvvNumberFieldName}`,
         securityCodeLabel: `#${cvvNumberFieldName}-label`,
         cardNumberContainer: `#${creditCardNumberFieldName}`,
         cardNumberLabel: `#${creditCardNumberFieldName}-label`
       });
       setFlexMicroform(microform);
     }
   }, [creditCardNumberFieldName, cvvNumberFieldName]);
 
   useEffect(() => {
     if (flexContext && flexMicroform && flexSdkUrl) {
       amdJsLoad(flexSdkUrl, 'Flex').then(() => {
         updateState('flexMicroForm', flexMicroform);
         return flexMicroform.setup(flexContext.captureContext);
       });
     }
   }, [flexContext, flexMicroform, flexSdkUrl]);
 
   useEffect(() => {
     if (flexMicroform && flexMicroform.number) {
       flexMicroform.number.on('change', onCardNumberChange);
     }
   }, [flexMicroform && flexMicroform.number]);
 
   useEffect(() => {
     if (flexMicroform && flexMicroform.securityCode) flexMicroform.securityCode.on('change', onSecurityCodeChange);
   }, [flexMicroform && flexMicroform.securityCode]);
 
   return (
     <Styled id="CheckoutCardDetails" css={css}>
       <div className="CheckoutCardDetails" ref={cardContainerElementRef}>
         <div className="CheckoutCardDetails__Row CheckoutCardDetails__CardNumberAndTypeContainer">
           <div className={"CheckoutCardDetails__CardNumberContainer"}>
             <label id={`${creditCardNumberFieldName}-label`} htmlFor={creditCardNumberFieldName}>
               {labelCardNumber}
             </label>
             <div className={cardTypeNotEnabled? "CheckoutCardDetails_CardNumberNotSupported ": ""}>
               <div id={creditCardNumberFieldName} />
             </div>
             {cardTypeNotEnabled && <div className="CheckoutCardDetails__ErrorContainer">
               <span className="CheckoutCardDetails__ErrorMessage">
                 {cardTypeInvalid}
               </span>
               <span className="CheckoutCardDetails__ErrorIconContainer">
                 <WarningIcon />
               </span>
             </div>}
           </div>
           <div className="CheckoutCardDetails__CardTypeContainer">
             <CardTypes cardTypes={cardTypes} selectedCardType={selectedCardType} />
           </div>
         </div>
         <div className="CheckoutCardDetails__ExpiryDateCvvRow">
           <div className="CheckoutCardDetails__ExpiryDateContainer">
             <label htmlFor={`expiryMonth-${id}`}>{labelExpiryDate}</label>
             <div className="CheckoutCardDetails__ExpiryDateInputRegion">
               <input
                 className="CheckoutCardDetails__ExpiryDateInput CheckoutCardDetails__Input"
                 type="text"
                 id={`expiryMonth-${id}`}
                 name="expiryMonth"
                 onChange={onInputChange}
                 onBlur={validateInput}
                 value={cardDetails.expiryMonth}
                 maxLength={2}
                 ref={expiryMonthElementRef}
                 aria-label={labelExpiryMonth}
                 disabled={!useAnotherCard || isPaymentDisabled}
                 required
                 autoComplete="cc-exp-month"
                 inputMode="numeric"
               />
               <span className="CheckoutCardDetails__ExpiryDateSeparator">/</span>
               <input
                 className="CheckoutCardDetails__ExpiryDateInput CheckoutCardDetails__Input"
                 type="text"
                 id={`expiryYear-${id}`}
                 name="expiryYear"
                 onChange={onInputChange}
                 onBlur={validateInput}
                 value={cardDetails.expiryYear}
                 maxLength={2}
                 ref={expiryYearElementRef}
                 aria-label={labelExpiryYear}
                 disabled={!useAnotherCard || isPaymentDisabled}
                 required
                 autoComplete="cc-exp-year"
                 inputMode="numeric"
               />
             </div>
             <div className="CheckoutCardDetails__ErrorContainer">
               <span className="CheckoutCardDetails__ErrorMessage"></span>
               <span className="CheckoutCardDetails__ErrorIconContainer">
                 <WarningIcon />
               </span>
             </div>
           </div>
           <div className="CheckoutCardDetails__CvvContainer">
             <label htmlFor={cvvNumberFieldName} id={`${cvvNumberFieldName}-label`}>
               {labelCardCVV}
             </label>
             <div className="CheckoutCardDetails__CvvInputRegion" id={cvvNumberFieldName}></div>
             <div className="CheckoutCardDetails__ErrorContainer">
               <span className="CheckoutCardDetails__ErrorMessage"></span>
               <span className="CheckoutCardDetails__ErrorIconContainer">
                 <WarningIcon />
               </span>
             </div>
           </div>
         </div>
         <div className="CheckoutCardDetails__Row">
           <label htmlFor={`nameOnCard-${id}`}>{labelNameOnCard}</label>
           <input
             type="text"
             id={`nameOnCard-${id}`}
             name="nameOnCard"
             onChange={onInputChange}
             onBlur={validateInput}
             value={cardDetails.nameOnCard}
             disabled={!useAnotherCard || isPaymentDisabled}
             autoCapitalize="words"
             required
             autoComplete="cc-name"
             className="CheckoutCardDetails__Input"
           />
           <div className="CheckoutCardDetails__ErrorContainer">
             <span className="CheckoutCardDetails__ErrorMessage"></span>
             <span className="CheckoutCardDetails__ErrorIconContainer">
               <WarningIcon />
             </span>
           </div>
         </div>
       </div>
     </Styled>
   );
 };
 export default connect(getCardDetailsData)(IsvCheckoutCardDetails);
 