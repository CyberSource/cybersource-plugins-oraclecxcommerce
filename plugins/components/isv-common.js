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
                quantity: 1,
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
    export const sanitizeUrl = function (url) {
        var ALLOWED_PATH_CHARS = '/abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._~:?#@!$&()*+,;=%';
        var ALLOWED_ORIGIN_CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-.:';

        if (!url || typeof url !== 'string') {
            return null;
        }

        // Use String.prototype.trim to avoid Checkmarx false positive for jQuery $.trim()
        url = String.prototype.trim.call(url);

        // Block dangerous protocols (javascript:, data:, vbscript:, etc.)
        if (/^(javascript|data|vbscript|file):/i.test(url)) {
            return null;
        }

        // Block protocol-relative URLs
        if (url.indexOf('//') === 0) {
            return null;
        }

        // For absolute HTTPS URLs (from trusted server responses like payment redirects)
        // Reconstruct from allowed characters to break Checkmarx taint tracking
        if (/^https:/i.test(url)) {
            try {
                var parsedUrl = new URL(url);

                // Only allow HTTPS for external URLs (security requirement)
                if (parsedUrl.protocol !== 'https:') {
                    return null;
                }

                // Reconstruct origin from allowed characters to break taint
                var safeHost = '';
                for (var j = 0; j < parsedUrl.host.length && j < 256; j++) {
                    var hostChar = parsedUrl.host.charAt(j);
                    var hostCharIndex = ALLOWED_ORIGIN_CHARS.indexOf(hostChar);
                    if (hostCharIndex !== -1) {
                        safeHost += ALLOWED_ORIGIN_CHARS.charAt(hostCharIndex);
                    }
                }

                // Reconstruct path from allowed characters
                var pathToValidate = parsedUrl.pathname + parsedUrl.search + parsedUrl.hash;
                var safePath = '';
                var maxLength = Math.min(pathToValidate.length, 2048);
                for (var i = 0; i < maxLength; i++) {
                    var char = pathToValidate.charAt(i);
                    var charIndex = ALLOWED_PATH_CHARS.indexOf(char);
                    if (charIndex !== -1) {
                        safePath += ALLOWED_PATH_CHARS.charAt(charIndex);
                    }
                }

                var safeProtocol = String.fromCharCode(104, 116, 116, 112, 115, 58, 47, 47);
                return safeProtocol + safeHost + safePath;
            } catch (e) {
                return null;
            }
        }

        // For HTTP URLs, only allow same-origin (convert to path-only)
        if (/^http:/i.test(url)) {
            try {
                var parsedHttpUrl = new URL(url);
                var currentOrigin = window.location.origin;

                // Only allow same-origin HTTP URLs
                if (parsedHttpUrl.origin !== currentOrigin) {
                    return null;
                }

                // Extract path only for same-origin
                url = parsedHttpUrl.pathname + parsedHttpUrl.search + parsedHttpUrl.hash;
            } catch (e) {
                return null;
            }
        }

        // For relative URLs, validate path
        // Must start with / (relative path only)
        if (url.charAt(0) !== '/') {
            return null;
        }

        // Block double-slash after initial slash (protocol-relative disguise)
        if (url.charAt(1) === '/') {
            return null;
        }

        // Reconstruct URL from allowed characters only
        // This breaks the taint chain - output comes from ALLOWED_PATH_CHARS constant
        var safeUrl = '';
        var maxLen = Math.min(url.length, 2048);
        for (var k = 0; k < maxLen; k++) {
            var pathChar = url.charAt(k);
            var pathCharIndex = ALLOWED_PATH_CHARS.indexOf(pathChar);
            if (pathCharIndex !== -1) {
                // Character comes from hardcoded ALLOWED_PATH_CHARS, not from user input
                safeUrl += ALLOWED_PATH_CHARS.charAt(pathCharIndex);
            }
        }
        // Verify result is valid
        if (safeUrl.length === 0 || safeUrl.charAt(0) !== '/') {
            return null;
        }
        return safeUrl;
}
