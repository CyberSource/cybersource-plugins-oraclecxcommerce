/* eslint-disable no-inner-declarations */
import React, {useMemo} from 'react';
import Styled from '@oracle-cx-commerce/react-components/styled';
import css from '../../styles/flex.css';
import {connect} from '@oracle-cx-commerce/react-components/provider';
import {getFlexMicroformRepository} from '../../../../selectors';
import IsvCreditCard from './IsvCreditCard';
/**
 * Credit Card widget allows to enter card details or select a saved card. Contains nested components for saved cards, card details, billing address and
 * save card to profile.
 * @param props
 */
const IsvCreditCardPaymentMethod = props => {
  const {flexContext, deviceFingerprint = {}, flexSdkUrl} = props;

  return (
    <React.Fragment>
      {useMemo(
        () => (
          <Styled id="IsvCreditCardPaymentMethod" css={css}>
            <IsvCreditCard
              flexContext={flexContext}
              deviceFingerprint={deviceFingerprint}
              {...props}
              flexSdkUrl={flexSdkUrl}
            />
          </Styled>
        ),
        [flexContext]
      )}
    </React.Fragment>
  );
};

export default connect(getFlexMicroformRepository)(IsvCreditCardPaymentMethod);
