/* eslint-disable no-inner-declarations */
/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.
 */
import React, {useState, useEffect, useMemo} from 'react';
import Radio from '@oracle-cx-commerce/react-components/radio';
import {noop, t} from '@oracle-cx-commerce/utils/generic';
import CardCVVIcon from '@oracle-cx-commerce/react-components/icons/card-cvv';
import WarningIcon from '@oracle-cx-commerce/react-components/icons/warning';
import {formatCardNumber, validateCVV} from '@oracle-cx-commerce/react-components/utils/payment';
import {PAYMENT_TYPE_CARD} from '@oracle-cx-commerce/commerce-utils/constants';

const IsvCheckoutSavedCardItem = props => {
  const {
    labelSavedCard,
    id,
    labelCardCVV,
    cardTypes = {},
    cardDetails,
    selectedSavedCardId,
    onSelectSavedCard,
    setElementValidity,
    textFieldInvalid,
    textRequiredField,
    textExpiryDate,
    onInput = noop,
    isCardPaymentDisabled,
    selectedPaymentType,
    deviceFingerprint
  } = props;

  const creditCardNumberFieldName = useMemo(
    () => `cardDetails-${id}-${selectedSavedCardId}`,
    [id, selectedSavedCardId]
  );
  const cvvNumberFieldName = useMemo(() => `cvv-${id}-${selectedSavedCardId}`, [id, selectedSavedCardId]);
  const {savedCardId, nameOnCard, expiryMonth, expiryYear, cardType, cardNumber: maskedCardNumber} = cardDetails;
  const card = cardTypes[cardType];
  let imgSrc = null;
  let cardImageAltText = cardType;
  let cvvLength = 3;
  if (card) {
    cardImageAltText = card.name;
    cvvLength = card.cvvLength;
    if (card.img) {
      imgSrc = card.img.url;
    }
  }

  useEffect(() => {
    if(onInput){
    onInput({
            ...(selectedSavedCardId && { savedCardId: selectedSavedCardId }),
            type: PAYMENT_TYPE_CARD,
            customProperties: {
              deviceFingerprint
            }
  })}}, [selectedSavedCardId, isCardPaymentDisabled])


  const isSavedCardSelected = selectedPaymentType === PAYMENT_TYPE_CARD && selectedSavedCardId === savedCardId;

  return (
    <div className={`CheckoutSavedCards__Item${isSavedCardSelected ? ' CheckoutSavedCards__Item--selected' : ''}`}>
      <div className="CheckoutSavedCards__RadioButtonContainer">
        <Radio
          className="CheckoutSavedCards__RadioButton"
          id={id}
          name={savedCardId}
          value={savedCardId}
          checked={isSavedCardSelected}
          disabled={isCardPaymentDisabled}
          onChange={onSelectSavedCard}
          aria-label={t(labelSavedCard, {
            cardNumber: maskedCardNumber.substr(-4),
            cardType: card ? card.name : '',
            nameOnCard,
            expiryDate: `${expiryMonth}/${expiryYear}`
          })}
        ></Radio>
      </div>
      <div className="CheckoutSavedCards__CardTypeContainer">
        <img className="CheckoutSavedCards__CardTypeImg" src={imgSrc} alt={cardImageAltText} />
      </div>
      <div id={creditCardNumberFieldName} className="CheckoutSavedCards__CardDetailsContainer">
        <span className="CheckoutSavedCards__CardNumber">
          {formatCardNumber(maskedCardNumber, card ? card.repositoryId : '')}
        </span>
        <span>{nameOnCard}</span>
        <span id={`expiryDate-${id}-${savedCardId}`}>{t(textExpiryDate, {month: expiryMonth, year: expiryYear})}</span>
      </div>
    </div>
  );
};

export default IsvCheckoutSavedCardItem;
