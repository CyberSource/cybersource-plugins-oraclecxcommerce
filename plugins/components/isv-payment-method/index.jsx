/* eslint-disable no-inner-declarations */
import React, {useContext, useEffect,useState} from 'react';
import {StoreContext} from '@oracle-cx-commerce/react-ui/contexts';
import {connect} from '@oracle-cx-commerce/react-components/provider';
import {getCurrentOrder, getGlobalContext} from '@oracle-cx-commerce/commerce-utils/selector';
import {isEmptyObject} from '@oracle-cx-commerce/utils/generic';
import {usePaymentMethodConfigFetcher} from '../../fetchers/hooks';
import {getPaymentMethodConfigRepository} from '../../selectors';
import IsvGooglePayPaymentMethod from './components/isv-googlepay-payment-method';
import IsvCreditCardPaymentMethod from './components/isv-credit-card-payment-method';
import IsvApplePayPaymentMethod from './components/isv-applepay-payment-method';
import {amdJsLoad} from './isv-payment-utility/script-loader';

export var getOrderData;

const IsvPaymentMethod = props => {
  const {paymentMethods = [], deviceFingerprint = {}, alertTechnicalProblemTryAgain} = props || {};
  const store = useContext(StoreContext);
  const {action, getState} = store;
  const {isPreview} = getGlobalContext(store.getState());
  var payerAuthEnabled, songbirdUrl, flexSdkUrl;
  let creditCardConfiguration = [],
    itemDetails = [],
    shoppingCartItems = [],
    applePayConfiguration = [];
  var applePayEnabled, creditCardEnabled = false, applePaySupported = false;
  const [isError, setError] = useState(false);
  
  getOrderData = function () {
    var order = getCurrentOrder(getState());
    var json = {};
    shoppingCartItems = order.commerceItems;
    if (!isEmptyObject(shoppingCartItems)) {
      Object.keys(shoppingCartItems).forEach(key => {
        itemDetails.push({
          productId: shoppingCartItems[key].productId,
          quantity: shoppingCartItems[key].quantity
        });
      });
    }
    if(order?.priceInfo) {
      json = {
        currencyCode: order.priceInfo.currencyCode,
        orderId: order.id,
        shoppingCart: {
          orderTotal: order.priceInfo.amount,
          items: itemDetails
        }
      };
    }
    return json;
  };

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
    songbirdUrl = key.config.songbirdUrl;
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
    if(creditCardEnabled){
      action('flexMicroformAction', {isPreview}).then(response => {
        if (!response.ok) {
          setError(true);
        }
      });
    }
  },[creditCardEnabled]);
  
  useEffect(() => {
    usePaymentMethodConfigFetcher(store).then(response => {
      if(!response.ok) {
        setError(true);
      }
    });
  }, []);

  useEffect(() => {
    if (payerAuthEnabled) {
      action('getPayerAuthTokenAction', {isPreview}).then(response => {
        if(!response.ok){
          setError(true);
        }
      });
      amdJsLoad(songbirdUrl, 'SongBird');
    }
  }, [payerAuthEnabled]);

  useEffect(() => {
    if (deviceFingerprint && deviceFingerprint.deviceFingerprintEnabled && deviceFingerprint?.deviceFingerprintData) {
      const dfpUrl = `${deviceFingerprint.deviceFingerprintUrl}?org_id=${deviceFingerprint.deviceFingerprintOrgId}&session_id=${deviceFingerprint.deviceFingerprintData.deviceFingerprintSessionId}`;
      amdJsLoad(dfpUrl, 'DFPScript');
    }
  }, [deviceFingerprint]);

  const [isvSelectedGenericPayment, setIsvSelectedGenericPayment] = useState();

  if (isError) {
    action('notify', {level: 'error', message: alertTechnicalProblemTryAgain});
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
