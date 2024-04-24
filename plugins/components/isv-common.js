import { DEVICE_CHANNEL, IP_ENDPOINT_URL, REPLACE_CHARACTER, RETURN_URL, LINEITEMS, ACCEPT_BROWSER_VALUE } from "./constants";
import { getOrder } from "@oracle-cx-commerce/react-widgets/profile/profile-order-history/utils";

export const replaceSpecialCharacter = (obj) => {
    Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            replaceSpecialCharacter(obj[key]);
        } else if (typeof obj[key] === "string") {
            obj[key] = obj[key].replaceAll("=", REPLACE_CHARACTER);
        }
    });
};

export const getIpAddress = (suppressError = false) => {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', IP_ENDPOINT_URL);
        xhr.onload = () => {
            if (xhr.status === 200) {
                const data = JSON.parse(xhr.responseText);
                resolve(data.ip);
            } else {
                suppressError ? resolve('') : reject();
            }
        };
        xhr.onerror = () => {
            suppressError ? resolve('') : reject();
        };
        xhr.send();
    })
}


export const getOptionalPayerAuthFields = () => {
    const isJavascriptEnabled = 'undefined' !== typeof window 
        && 'undefined' !== typeof window.document
        && 'function' === typeof window.document.createElement

    const isBrowser = typeof window !== "undefined";
    let [returnUrl, deviceChannel, httpBrowserJavaEnabled, httpAcceptBrowserValue, httpBrowserLanguage,
        httpBrowserColorDepth, httpBrowserScreenHeight, httpBrowserScreenWidth, httpBrowserTimeDifference,
        userAgentBrowserValue, httpBrowserJavaScriptEnabled, httpAcceptContent] = Array(14).fill("");
    if (isBrowser) {
        returnUrl = window.location.origin + RETURN_URL;
        deviceChannel = DEVICE_CHANNEL.BROWSER;
        httpBrowserJavaEnabled = window.navigator.javaEnabled().toString();
        httpAcceptBrowserValue = ACCEPT_BROWSER_VALUE;
        httpBrowserLanguage = window.navigator.language.toString();
        httpBrowserColorDepth = window.screen.colorDepth.toString();
        httpBrowserScreenHeight = window.screen.height.toString();
        httpBrowserScreenWidth = window.screen.width.toString();
        httpBrowserTimeDifference = new Date().getTimezoneOffset().toString();
        userAgentBrowserValue = window.navigator.userAgent.toString();
        httpBrowserJavaScriptEnabled = isJavascriptEnabled.toString();
        httpAcceptContent = httpAcceptBrowserValue;
    }
    return {
        returnUrl,
        deviceChannel,
        httpBrowserJavaEnabled,
        httpAcceptBrowserValue,
        httpBrowserLanguage,
        httpBrowserColorDepth,
        httpBrowserScreenHeight,
        httpBrowserScreenWidth,
        httpBrowserTimeDifference,
        userAgentBrowserValue,
        httpBrowserJavaScriptEnabled,
        httpAcceptContent,
    };
};

export const getAccountPurchaseHistory = async (profileId, action) => {
    return new Promise((resolve) => {
        let filteredOrders;
        const getOrderCallBack =
            (recentOrderIds, response) => {
                const items = response?.json?.items;
                let currentDate = new Date();
                currentDate.setMonth(currentDate.getMonth() - 6);
                filteredOrders = items && items.filter((item) => {
                    const lastModifiedDate = new Date(item.lastModifiedDate);
                    return lastModifiedDate >= currentDate
                });
                resolve(filteredOrders?.length);
            }
        if (profileId != 'anonymous') {
            getOrder(`profileId eq ${profileId}`, 0, null, action, null, getOrderCallBack);
        }
        else {
            resolve(null);
        }
    })
}

export const getLineItemDetails = async (order) => {
    return new Promise((resolve) => {
        const couponCode = order?.discountInfo?.orderCouponsMap ? Object.keys(order?.discountInfo?.orderCouponsMap) : false;
        const couponDetails = Object.values(order?.discountInfo?.orderCouponsMap || {});
        const discountInfo = {
            discountAmount: couponDetails[0]?.totalAdjustment && Math.abs(couponDetails[0]?.totalAdjustment).toFixed(2).toString(),
            discountSku: couponDetails[0]?.promotionId || ''
        }

        let lineItems = Object.values(order?.commerceItems).map(item => {
            return {
                productName: item.displayName,
                quantity: item.quantity,
                productSku: item?.catRefId,
                productCode: LINEITEMS.DEFAULT,
                unitPrice: item?.detailedItemPriceInfo[0]?.detailedUnitPrice.toFixed(2).toString(),
                totalAmount: item.price.toFixed(2).toString(),
            }
        })
        let shippingCharge = (order?.priceInfo?.shipping + order?.priceInfo?.shippingSurchargeValue).toFixed(2).toString();
        let shippingDetails = {
            productName: LINEITEMS.SHIPPING_AND_HANDLING,
            quantity: 1,
            productSku: LINEITEMS.SHIPPING_AND_HANDLING,
            productCode: LINEITEMS.SHIPPING_AND_HANDLING,
            unitPrice: shippingCharge,
            totalAmount: shippingCharge
        }
        lineItems.push(shippingDetails);
        if (discountInfo?.discountAmount) {
            const discountDetails = {
                productName: couponCode[0],
                quantity: '1',
                productSku: discountInfo.discountSku,
                productCode: LINEITEMS.COUPON,
                unitPrice: discountInfo.discountAmount,
                totalAmount: discountInfo.discountAmount
            }

            lineItems.push(discountDetails)
        }
        return resolve(lineItems);
    })
}

export const additionalFieldsMapper = async (profileId, action, order) => {
    return new Promise(async (resolve) => {
        const numberOfPurchases = await getAccountPurchaseHistory(profileId, action);
        const lineItems = await getLineItemDetails(order);
        const subTotal = order?.priceInfo?.subTotal;
        const couponCode = order?.discountInfo?.orderCouponsMap && Object.keys(order?.discountInfo?.orderCouponsMap);
        resolve({
            ipAddress: await getIpAddress(true),
            lineItems: JSON.stringify(lineItems),
            ...(couponCode && { couponCode: couponCode[0] }),
            subTotal: subTotal.toFixed(2).toString(),
            ...(numberOfPurchases && { numberOfPurchases: numberOfPurchases.toString() }),
        })
    })
}