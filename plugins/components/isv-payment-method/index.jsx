/* eslint-disable no-inner-declarations */
import React, {useContext, useEffect} from 'react';
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
  const {paymentMethods = [], deviceFingerprint = {}} = props || {};
  const store = useContext(StoreContext);
  const {action, getState} = store;
  const {isPreview} = getGlobalContext(store.getState());
  var payerAuthEnabled, songbirdUrl, flexSdkUrl;
  let payerAuthConfiguration = [],
    itemDetails = [],
    shoppingCartItems = [],
    applePayConfiguration = [];
  var applePayEnabled = false;
  var applePaySupported = false;

  getOrderData = function () {
    var order = getCurrentOrder(getState());
    shoppingCartItems = order.commerceItems;
    if (!isEmptyObject(shoppingCartItems)) {
      Object.keys(shoppingCartItems).forEach(key => {
        itemDetails.push({
          productId: shoppingCartItems[key].productId,
          quantity: shoppingCartItems[key].quantity
        });
      });
    }
    var json = {
      currencyCode: order.priceInfo.currencyCode,
      orderId: order.id,
      shoppingCart: {
        orderTotal: order.priceInfo.amount,
        items: itemDetails
      }
    };
    return json;
  };

  if (typeof paymentMethods === 'object' && !Array.isArray(paymentMethods) && paymentMethods !== null) {
    payerAuthConfiguration = Object.entries(paymentMethods)
      .map(entry => entry[1])
      .filter(paymentMethod => paymentMethod.type === 'card');
    applePayConfiguration = Object.entries(paymentMethods)
      .map(entry => entry[1])
      .filter(paymentMethod => paymentMethod.type === 'applepay');
  } else if (Array.isArray(paymentMethods)) {
    payerAuthConfiguration = paymentMethods?.filter(paymentMethod => paymentMethod.type === 'card');
    applePayConfiguration = paymentMethods?.filter(paymentMethod => paymentMethod.type === 'applepay');
  }

  payerAuthConfiguration.forEach(key => {
    payerAuthEnabled = key.config.payerAuthEnabled;
    songbirdUrl = key.config.songbirdUrl;
    flexSdkUrl = key.config.flexSdkUrl;
  });

  applePayConfiguration.forEach(key => {
    applePayEnabled = true;
  });

  if (applePayEnabled && window.ApplePaySession && window.ApplePaySession.canMakePayments()) {
    applePaySupported = true;
  }

  useEffect(() => {
    action('flexMicroformAction', {isPreview});
    usePaymentMethodConfigFetcher(store);
  }, []);

  useEffect(() => {
    if (payerAuthEnabled) {
      action('getPayerAuthTokenAction', {isPreview});
      amdJsLoad(songbirdUrl, 'SongBird');
    }
  }, [payerAuthEnabled]);

  useEffect(() => {
    if (deviceFingerprint && deviceFingerprint.deviceFingerprintEnabled && deviceFingerprint?.deviceFingerprintData) {
      const dfpUrl = `${deviceFingerprint.deviceFingerprintUrl}?org_id=${deviceFingerprint.deviceFingerprintOrgId}&session_id=${deviceFingerprint.deviceFingerprintData.deviceFingerprintSessionId}`;
      amdJsLoad(dfpUrl, 'DFPScript');
    }
  }, [deviceFingerprint]);

  if (applePaySupported) {
    return (
      <>
        <IsvCreditCardPaymentMethod {...props} flexSdkUrl={flexSdkUrl} />
        <IsvGooglePayPaymentMethod {...props} />
        <IsvApplePayPaymentMethod {...props} />
      </>
    );
  } else {
    return (
      <>
        <IsvCreditCardPaymentMethod {...props} flexSdkUrl={flexSdkUrl} />
        <IsvGooglePayPaymentMethod {...props} />
      </>
    );
  }
};

export default connect(getPaymentMethodConfigRepository)(IsvPaymentMethod);
