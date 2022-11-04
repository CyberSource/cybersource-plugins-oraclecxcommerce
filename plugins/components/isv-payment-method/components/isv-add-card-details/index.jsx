/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.
 */
import React from 'react';
import CheckoutBillingAddress from '@oracle-cx-commerce/react-widgets/checkout/checkout-credit-card/components/checkout-billing-address';
import CheckoutSaveCardToProfile from '@oracle-cx-commerce/react-widgets/checkout/checkout-credit-card/components/checkout-save-card-to-profile';
import IsvCheckoutCardDetails from '../isv-checkout-card-details';

// Add new card details component containing card details, billing address and save card to profile component
const IsvAddCardDetails = props => {
  // Get the card details,billing address and save card to profile if there is a applied credit card payment group
  const {appliedCreditCardPaymentGroup, flexContext, deviceFingerprint, flexSdkUrl, ...remainingProps} = props;
  let appliedPaymentGroupBillingAddress, appliedPaymentGroupSaveCardToProfile, appliedPaymentGroupCardDetails;
  if (appliedCreditCardPaymentGroup && !appliedCreditCardPaymentGroup.savedCardId) {
    const {billingAddress, saveCard, ...remainingCardDetails} = appliedCreditCardPaymentGroup;
    appliedPaymentGroupCardDetails = remainingCardDetails;
    appliedPaymentGroupBillingAddress = billingAddress;
    appliedPaymentGroupSaveCardToProfile = saveCard === 'true' ? true : false;
  }

  return (
    <React.Fragment>
      <IsvCheckoutCardDetails
        flexContext={flexContext}
        deviceFingerprint={deviceFingerprint}
        flexSdkUrl={flexSdkUrl}
        {...remainingProps}
        appliedPaymentGroupCardDetails={appliedPaymentGroupCardDetails}
      />
      <CheckoutSaveCardToProfile
        {...remainingProps}
        appliedPaymentGroupSaveCardToProfile={appliedPaymentGroupSaveCardToProfile}
      />
      <CheckoutBillingAddress
        {...remainingProps}
        appliedPaymentGroupBillingAddress={appliedPaymentGroupBillingAddress}
      />
    </React.Fragment>
  );
};

export default IsvAddCardDetails;
