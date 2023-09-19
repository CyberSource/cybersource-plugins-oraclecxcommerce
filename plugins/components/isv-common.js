import { DEVICE_CHANNEL, IP_ENDPOINT_URL, REPLACE_CHARACTER, RETURN_URL } from "./constants";

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

    const isJavascriptEnabled = typeof window !== 'undefined'
        && typeof window.document !== 'undefined'
        && typeof window.document.createElement === 'function';

    const isBrowser = typeof window !== "undefined";

    var [returnUrl, deviceChannel, httpBrowserJavaEnabled, httpAcceptBrowserValue, httpBrowserLanguage,
        httpBrowserColorDepth, httpBrowserScreenHeight, httpBrowserScreenWidth, httpBrowserTimeDifference,
        userAgentBrowserValue, httpBrowserJavaScriptEnabled, httpAcceptContent] = Array(14).fill("");
    if (isBrowser) {
        returnUrl = window.location.origin + RETURN_URL;
        deviceChannel = DEVICE_CHANNEL.BROWSER;
        httpBrowserJavaEnabled = window.navigator.javaEnabled().toString();
        httpAcceptBrowserValue = window.navigator.appVersion.toString();
        httpBrowserLanguage = window.navigator.language.toString();
        httpBrowserColorDepth = window.screen.colorDepth.toString();
        httpBrowserScreenHeight = window.screen.height.toString();
        httpBrowserScreenWidth = window.screen.width.toString();
        httpBrowserTimeDifference = new Date().getTimezoneOffset().toString();
        userAgentBrowserValue = window.navigator.userAgent.toString();
        httpBrowserJavaScriptEnabled = isJavascriptEnabled.toString();
        httpAcceptContent = userAgentBrowserValue;
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


