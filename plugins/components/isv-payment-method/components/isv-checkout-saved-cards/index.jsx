/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.
 */

import React, {useCallback, useEffect, useRef, useState} from 'react';
import RadioButton from '@oracle-cx-commerce/react-components/radio';
import Styled from '@oracle-cx-commerce/react-components/styled';
import {connect} from '@oracle-cx-commerce/react-components/provider';
import css from '@oracle-cx-commerce/react-widgets/checkout/checkout-credit-card/components/checkout-saved-cards/styles.css';
import {getCheckoutSavedCardsData} from '@oracle-cx-commerce/react-widgets/checkout/checkout-credit-card/components/checkout-saved-cards/selectors';
import {noop} from '@oracle-cx-commerce/utils/generic';
import {PAYMENT_TYPE_CARD} from '@oracle-cx-commerce/commerce-utils/constants';
import IsvCheckoutSavedCardItem from '../isv-checkout-saved-card-item';

/**
 * Widgets displays saved cards on the checkout payment page.
 */
const IsvCheckoutSavedCards = props => {
  const {
    appliedCreditCardPaymentGroup,
    addDifferentCardCallback = noop,
    id,
    isApprovalRequired,
    isCardPaymentDisabled = false,
    isLoggedIn,
    defaultSavedCardId,
    savedCards,
    labelUseAnotherCard,
    onInput = noop,
    useAnotherCard = false,
    hasOtherAppliedPayments,
    selectedPaymentType,
    setSelectedPaymentType,
    updateSelectedPaymentType,
    flexContext,
    deviceFingerprint
  } = props;

  const [selectedSavedCardId, setSelectedSavedCardId] = useState(defaultSavedCardId);
  const savedCardsListElementRef = useRef(null);

  // If there is an applied credit card payment group set appliedSavedCardId with savedCardId from the payment group
  // else if there is an applied credit card payment group but not with saved card set applied saved card id to null so none of the saved cards are selected.
  let appliedPaymentGroupSavedCardId;
  if (appliedCreditCardPaymentGroup) {
    appliedPaymentGroupSavedCardId = appliedCreditCardPaymentGroup.savedCardId
      ? appliedCreditCardPaymentGroup.savedCardId
      : null;
  }

  // Update the selected payment type to card in case of default saved card
  // if there are no other applied payment groups
  useEffect(() => {
    if (selectedSavedCardId && !isCardPaymentDisabled && !hasOtherAppliedPayments) {
      setSelectedPaymentType(PAYMENT_TYPE_CARD);
    }
  }, [isCardPaymentDisabled, hasOtherAppliedPayments, selectedSavedCardId, setSelectedPaymentType]);

  // If a different payment type is selected, reset selected saved card id
  useEffect(() => {
    if (selectedPaymentType && selectedPaymentType !== PAYMENT_TYPE_CARD) {
      setSelectedSavedCardId(null);
    }
  }, [selectedPaymentType]);

  // Reset saved card id , if card payment is disabled
  useEffect(() => {
    if (isCardPaymentDisabled) {
      // clear  invalid messages since the field will be disabled
      const savedCardsListElement = savedCardsListElementRef.current;
      if (savedCardsListElement) {
        const invalidElement = savedCardsListElement.querySelector('.CheckoutSavedCards__Invalid');
        if (invalidElement) {
          invalidElement.classList.remove('CheckoutSavedCards__Invalid');
          invalidElement.setCustomValidity('');
          const errorMessageContainer = invalidElement.parentElement.nextElementSibling.querySelector(
            '.CheckoutSavedCards__ErrorMessage'
          );
          if (errorMessageContainer) {
            errorMessageContainer.textContent = '';
          }
        }
      }
    }
  }, [isCardPaymentDisabled]);

  //Set the selectedSavedCardId to appliedPaymentGroupSavedCardId if it is set.
  useEffect(() => {
    if (appliedPaymentGroupSavedCardId !== undefined) {
      setSelectedSavedCardId(appliedPaymentGroupSavedCardId);
    }
  }, [appliedPaymentGroupSavedCardId]);

  /**
   * Called on selection of a different saved card
   * @param {Object} event The event object
   */
  const onSelectSavedCard = useCallback(
    event => {
      setSelectedSavedCardId(event.target.value);
      updateSelectedPaymentType(PAYMENT_TYPE_CARD);
      onInput({});
      // deselect new card details entry section
      if (useAnotherCard) {
        addDifferentCardCallback(false);
      }
    },
    [addDifferentCardCallback, onInput, updateSelectedPaymentType, useAnotherCard]
  );

  /**
   * Called on selection of add another card option
   */
  const onAddAnotherCreditCard = () => {
    addDifferentCardCallback(true);
    updateSelectedPaymentType(PAYMENT_TYPE_CARD);
    setSelectedSavedCardId(null);
  };

  /**
   * Validate element to set any custom errors
   * @param {Object} The element to validate
   * @param {function} The function to validate element
   */
  const setElementValidity = useCallback((element, validator) => {
    element.setCustomValidity('');
    element.classList.remove('CheckoutSavedCards__Invalid');
    if (validator) {
      element.setCustomValidity(validator(element.value));
    }
    if (element.validationMessage) {
      element.classList.add('CheckoutSavedCards__Invalid');
    }
    const errorMessageContainer = element.parentElement.nextElementSibling.querySelector(
      '.CheckoutSavedCards__ErrorMessage'
    );
    if (errorMessageContainer) {
      errorMessageContainer.textContent = element.validationMessage;
    }
  }, []);

  return (
    <Styled id="CheckoutSavedCards" css={css}>
      <div className="CheckoutSavedCards">
        {isLoggedIn && savedCards.length > 0 ? (
          <ul id={`savedCardsList-${id}`} className="CheckoutSavedCards__List" ref={savedCardsListElementRef}>
            {savedCards.map(savedCard => (
              <li key={savedCard.savedCardId} className="CheckoutSavedCards__ListItem">
                <IsvCheckoutSavedCardItem
                  cardDetails={savedCard}
                  onSelectSavedCard={onSelectSavedCard}
                  selectedSavedCardId={selectedSavedCardId}
                  setElementValidity={setElementValidity}
                  isCardPaymentDisabled={isCardPaymentDisabled}
                  flexContext={flexContext}
                  deviceFingerprint={deviceFingerprint}
                  {...props}
                />
              </li>
            ))}
          </ul>
        ) : null}
        {isLoggedIn && !isApprovalRequired ? (
          <div className="CheckoutSavedCards__AddAnotherCardContainer">
            <RadioButton
              id={`addDifferentCreditCard-${id}`}
              className="CheckoutSavedCards__RadioButton"
              name="addNewCreditCardRadio"
              disabled={isCardPaymentDisabled}
              checked={selectedPaymentType === PAYMENT_TYPE_CARD && useAnotherCard}
              value={PAYMENT_TYPE_CARD}
              labelText={labelUseAnotherCard}
              onChange={onAddAnotherCreditCard}
            />
          </div>
        ) : null}
      </div>
    </Styled>
  );
};

export default connect(getCheckoutSavedCardsData)(IsvCheckoutSavedCards);
