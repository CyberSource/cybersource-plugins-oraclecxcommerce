
const isvPaymentCustomProperties: string[] = [
    "transientTokenJwt",
    "captureContext",
    "captureContextCipherEncrypted",
    "captureContextCipherIv",
    "referenceId",
    "paymentToken",
    "paymentType",
    "authJwt",
    "deviceFingerprintSessionId",
    "deviceFingerprintCipherEncrypted",
    "deviceFingerprintCipherIv",
    "authTime",
    "dmMsg",
    "stepUpUrl",
    "authenticationTransactionId",
    "pareq",
    "accessToken",
    "numberOfPurchases",
    "couponCode",
    "lineItems",
    "paymentStatus"
]

export const addCustomProperties = (webhookRequest: OCC.GenericPaymentWebhookRequest) => {
    const { customProperties } = webhookRequest || {};
    let filteredProperties;
    if (customProperties) {
        filteredProperties = Object.keys(customProperties)
        .filter((key: string) => !isvPaymentCustomProperties.includes(key))
        .reduce((obj: Record<string, string | boolean | Object | undefined>, key: string) => {
            obj[key] = customProperties[key as keyof OCC.CustomProperties];
            return obj;
        }, {});
    }
    return filteredProperties;
}