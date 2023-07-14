/* eslint-disable no-inner-declarations */
import React, { useContext, useEffect, useState } from 'react';
import { StoreContext } from '@oracle-cx-commerce/react-ui/contexts';
import { connect } from '@oracle-cx-commerce/react-components/provider';
import { getGlobalContext } from '@oracle-cx-commerce/commerce-utils/selector';
import { usePaymentMethodConfigFetcher } from '../../fetchers/hooks';
import { getPaymentMethodConfigRepository } from '../../selectors';
import IsvGooglePayPaymentMethod from './components/isv-googlepay-payment-method';
import IsvCreditCardPaymentMethod from './components/isv-credit-card-payment-method';
import IsvApplePayPaymentMethod from './components/isv-applepay-payment-method';
import { amdJsLoad } from './isv-payment-utility/script-loader';



const IsvPaymentMethod = props => {
  const { paymentMethods = [], deviceFingerprint = {}, alertTechnicalProblemTryAgain } = props || {};
  const store = useContext(StoreContext);
  const { action } = store;
  const { isPreview } = getGlobalContext(store.getState());
  var payerAuthEnabled, flexSdkUrl;
  let creditCardConfiguration = [],
    applePayConfiguration = [];
  var applePayEnabled, creditCardEnabled = false, applePaySupported = false;
  const [isError, setError] = useState(false);


  if (typeof paymentMethods === 'object' && !Array.isArray(paymentMethods) && paymentMethods !== null) {
    creditCardConfiguration = Object.entries(paymentMethods)
      .map(entry => entry[1])
      .filter(paymentMethod => paymentMethod.type === 'card');
    applePayConfiguration = Object.entries(paymentMethods)
      .map(entry => entry[1])
      .filter(paymentMethod => paymentMethod.type === 'applepay');
  } else if (Array.isArray(paymentMethods)) {
    creditCardConfiguration = paymentMethods?.filter(paymentMethod => paymentMethod.type === 'card');
    applePayConfiguration = paymentMethods?.filter(paymentMethod => paymentMethod.type === 'applepay');
  }

  creditCardConfiguration.forEach(key => {
    payerAuthEnabled = key.config.payerAuthEnabled;
    flexSdkUrl = key.config.flexSdkUrl;
  });

  applePayConfiguration.forEach(key => {
    applePayEnabled = true;
  });

  creditCardConfiguration.forEach(key => {
    creditCardEnabled = true;
  });
  if (applePayEnabled && window.ApplePaySession && window.ApplePaySession.canMakePayments()) {
    applePaySupported = true;
  }

  useEffect(() => {
    if (creditCardEnabled) {
      action('flexMicroformAction', { isPreview }).then(response => {
        if (!response.ok) {
          setError(true);
        }
      });
    }
  }, [creditCardEnabled]);

  useEffect(() => {
    usePaymentMethodConfigFetcher(store).then(response => {
      if (!response.ok) {
        setError(true);
      }
    });
  }, []);


  useEffect(() => {
    if (deviceFingerprint && deviceFingerprint.deviceFingerprintEnabled && deviceFingerprint?.deviceFingerprintData) {
      const dfpUrl = `${deviceFingerprint.deviceFingerprintUrl}?org_id=${deviceFingerprint.deviceFingerprintOrgId}&session_id=${deviceFingerprint.deviceFingerprintData.deviceFingerprintSessionId}`;
      amdJsLoad(dfpUrl, 'DFPScript');
    }
  }, [deviceFingerprint]);

  useEffect(() => {
    if (self != top) {
      top.location = encodeURI(self.location);
    }
  }, []);

  const [isvSelectedGenericPayment, setIsvSelectedGenericPayment] = useState();

  if (isError) {
    action('notify', { level: 'error', message: alertTechnicalProblemTryAgain });
    return null;
  } else if (applePaySupported) {
    return (
      <>
        <IsvCreditCardPaymentMethod {...props} flexSdkUrl={flexSdkUrl} />
        <IsvGooglePayPaymentMethod {...props} isvSelectedGenericPayment={isvSelectedGenericPayment} setIsvSelectedGenericPayment={setIsvSelectedGenericPayment} />
        <IsvApplePayPaymentMethod {...props} isvSelectedGenericPayment={isvSelectedGenericPayment} setIsvSelectedGenericPayment={setIsvSelectedGenericPayment} />
      </>
    );
  } else {
    return (
      <>
        <IsvCreditCardPaymentMethod {...props} flexSdkUrl={flexSdkUrl} />
        <IsvGooglePayPaymentMethod {...props} isvSelectedGenericPayment={isvSelectedGenericPayment} setIsvSelectedGenericPayment={setIsvSelectedGenericPayment} />
      </>
    );
  }
};

export default connect(getPaymentMethodConfigRepository)(IsvPaymentMethod);
