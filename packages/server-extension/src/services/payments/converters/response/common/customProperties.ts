
const isvPaymentCustomProperties: String[] = [
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
    "accessToken"
]
export const addCustomProperties = (webhookRequest: OCC.GenericPaymentWebhookRequest) => {
    const { customProperties } = webhookRequest || {};
    if (!customProperties) return;
    return Object.keys(customProperties)
        .filter((key: string) => !isvPaymentCustomProperties.includes(key))
        .reduce((obj: Record<string, string | boolean | Object | undefined>, key: string) => {
            obj[key] = customProperties[key as keyof OCC.CustomProperties];
            return obj;
        }, {});

}