declare module '*.json' {
  const value: any;
  export default value;
}

declare type DeepRequired<T> = {
  [P in keyof T]-?: DeepRequired<T[P]>;
};

declare type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>;
};

type WebhookAdditionalProperties = Record<string, string | boolean>;

type WebhookCustomPaymentProperties = string[] | boolean;

declare interface PaymentMethods {
  paymentMethods: PaymentMethodConfig[];
  deviceFingerprint: DeviceFingerprintConfig;
}

type PaymentMethodConfigProperties = CreditCardConfig | GooglePayConfig | ApplePayConfig;

declare interface PaymentMethodConfig {
  type: string;
  config: PaymentMethodConfigProperties;
}

declare interface CreditCardConfig {
  payerAuthEnabled: boolean;
  flexSdkUrl: string;
  songbirdUrl: string;
}

declare interface GooglePayConfig {
  googlePaySdkUrl: string;
  googlePayEnvironment: string;
  googlePayGateway: string;
  googlePayGatewayMerchantId: string;
  googlePayMerchantId: string;
  googlePayMerchantName: string;
  googlePaySupportedNetworks: string;
}

declare interface ApplePayConfig {
  applePaySupportedNetworks: string;
}

declare interface DeviceFingerprintConfig {
  deviceFingerprintEnabled: boolean;
  deviceFingerprintUrl: string;
  deviceFingerprintOrgId: string;
  deviceFingerprintData: OCC.DeviceFingerprintData;
}

// declare interface ChannelGatewaySettings {
//   [channel: string]: GatewaySettings;
// }

declare namespace OCC {
  export interface GatewaySettings {
    merchantID: string;
    authenticationType: string;
    runEnvironment: string;
    merchantKeyId: string;
    merchantsecretKey: string;
    keyAlias: string;
    keyPass: string;
    keyFileName: string;
    keysDirectory: string;
    enableLog: boolean;
    logFilename: string;
    logDirectory: string;
    logFileMaxSize: string;
    payerAuthKeyId: string;
    payerAuthKey: string;
    payerAuthOrgUnitId: string;
    payerAuthEnabled: boolean;
    paymentOptions: string;
    googlePaySdkUrl: string;
    googlePayEnvironment: string;
    googlePayGateway: string;
    googlePayGatewayMerchantId: string;
    googlePayMerchantId: string;
    googlePayMerchantName: string;
    googlePaySupportedNetworks: string;
    flexSdkUrl: string;
    saleEnabled: string;
    songbirdUrl: string;
    applePayMerchantId: string;
    applePayInitiative: string;
    applePayInitiativeContext: string;
    applePaySupportedNetworks: string;
    dmDecisionSkip: string;

    dailyReportName: string;

    deviceFingerprintEnabled: boolean;
    deviceFingerprintUrl: string;
    deviceFingerprintOrgId: string;

    [key: string]: string | boolean;
  }

  export interface GatewaySettingsResponse {
    data: {
      [channel: string]: GatewaySettings;
    };
  }

  export interface CardDetails {
    expirationMonth: string;
    expirationYear: string;
    cvv?: string;
    number?: string;
    type: string;
    holderName: string;
    saveCard?: boolean;
    maskedCardNumber?: string;
    token?: string;
  }

  export interface BillingAddress {
    lastName: string;
    postalCode: string;
    phoneNumber: string;
    email: string;
    state: string;
    address1: string;
    address2: string;
    firstName: string;
    city: string;
    country: string;
  }

  export interface ShippingAddress {
    lastName: string;
    postalCode: string;
    phoneNumber: string;
    email?: string;
    state: string;
    address1: string;
    address2: string;
    firstName: string;
    city: string;
    country: string;
  }

  export interface Profile {
    id: string;
    phoneNumber: string;
    email: string;
  }

  export interface ProfileDetails {
    id: string;
    lastName: string;
    firstName: string;
    taxExempt: boolean;
    profileType: string;
    receiveEmail: string;
    registrationDate: string;
    lastPasswordUpdate: string;
  }

  export interface AuxiliaryProperties {
    authenticationMethod: string;
    shopperAccountPaymentAccountFirstUseDate: string;
  }

  export interface ReferenceInfo {
    hostTransactionId?: string;
  }

  export interface CustomProperties {
    transientTokenJwt?: string;
    captureContext?: string;
    captureContextCipherEncrypted?: string;
    captureContextCipherIv?: string;
    referenceId?: string;
    paymentToken?: string;
    paymentType?: string;
    authJwt?: string;
    deviceFingerprintSessionId?: string;
    deviceFingerprintCipherEncrypted?: string;
    deviceFingerprintCipherIv?: string;
  }

  export interface CaptureContextRequest {
    targetOrigin: string;
  }

  export interface CapturePaymentRequest {
    merchantReferenceNumber: string;
    transactionId: string;
    currency: string;
    amount: string;
  }

  export interface CapturePaymentResponse {
    hostTransactionTimestamp: string;
    amount: string;
    responseCode: string;
    responseReason: string;
    merchantTransactionId: string;
    hostTransactionId: string;
    merchantTransactionTimestamp: string;
  }

  export interface CaptureContextResponse {
    captureContext: string;
    cipher: EncryptedText;
  }

  export interface DeviceFingerprintData {
    sessionId: string;
    cipher: EncryptedText;
  }

  export interface EncryptedText {
    iv: string;
    encrypted: string;
  }

  export interface OrderData {
    orderId?: string;
    currencyCode: string;
    shippingAddress?: OrderDataShippingAddress;
    billingAddress?: OrderDataBillingAddress;
    shoppingCart: ShoppingCart;
  }

  export interface OrderDataResponse {
    paymentGroups: PaymentGroup[];
  }

  export interface StatusProps {
    hostTransactionId: string;
  }
  export interface TransactionStatus {
    amount?: number;
    statusProps: StatusProps;
    transactionSuccess: boolean;
    transactionId?: string;
  }

  export interface PaymentGroup {
    authorizationStatus?: TransactionStatus[];
    debitStatus?: TransactionStatus[];
    id: string;
    state: 'AUTHORIZED' | 'SETTLED';
  }

  export interface ShoppingCart {
    items: ShoppingCartItem[];
    orderTotal: number;
  }

  export interface ShoppingCartItem {
    productId: string;
    quantity: number;
  }

  export interface OrderDataBillingAddress {
    lastName: string;
    postalCode: string;
    phoneNumber: string;
    email: string;
    state: string;
    address1: string;
    address2?: string;
    firstName: string;
    city: string;
    country: string;
  }

  export interface OrderDataShippingAddress {
    lastName: string;
    postalCode: string;
    phoneNumber: string;
    email?: string;
    state: string;
    address1: string;
    address2?: string;
    firstName: string;
    city: string;
    country: string;
  }

  export interface JwtPayload {
    orderDetails: JwtPayloadOrderDetails;
    consumer: JwtPayloadConsumerData;
  }

  export interface JwtPayloadOrderDetails {
    currencyCode: string;
    amount: number;
    orderNumber: string;
    orderDescription?: string;
    orderChannel?: string;
  }

  export interface JwtPayloadConsumerData {
    billingAddress: OrderDataBillingAddress;
    shippingAddress: OrderDataShippingAddress;
    email1: string;
    email2?: string;
  }

  export type WebhookGatewaySettings = Array<{ name: string; value: string }>;

  export interface GenericPaymentWebhookRequest {
    transactionId: string;
    currencyCode: string;
    paymentId: string;
    locale: string;
    siteURL: string;
    gatewaySettings?: WebhookGatewaySettings;
    cardDetails: CardDetails;
    amount: string;
    transactionType: string;
    transactionTimestamp: string;
    siteId: string;
    billingAddress: BillingAddress;
    channel: string;
    shippingAddress: ShippingAddress;
    orderId: string;
    paymentMethod: string;
    gatewayId: string;
    profile: Profile;
    profileDetails: ProfileDetails;
    retryPaymentCount: number;
    auxiliaryProperties: AuxiliaryProperties;
    referenceInfo?: ReferenceInfo;
    customProperties?: CustomProperties;
    order?: any;
  }

  export interface WebhookCommonResponse {
    amount: string;
    authCode: string;
    transactionId: string;
    transactionTimestamp: string;
    hostTransactionTimestamp: string;
    merchantTransactionTimestamp: string;
    tokenExpiryDate?: string;
    token?: string;
    responseCode: string;
    responseReason: string;
    responseDescription: string;
    paymentId: string;
    merchantTransactionId: string;
    hostTransactionId: string;
    paymentMethod: string;
    gatewayId: string;
    siteId: string;
    additionalProperties?: WebhookAdditionalProperties;
    customPaymentProperties?: WebhookCustomPaymentProperties;
  }

  export interface WebhookGenericResponse {
    code: string;
    reason: string;
    success: boolean;
  }

  export type AuthorizationResponse = WebhookCommonResponse;
  export type CaptureResponse = WebhookCommonResponse;
  export type CreditResponse = WebhookCommonResponse;
  export type VoidResponse = WebhookCommonResponse;

  export interface Link {
    rel: string;
    href: string;
  }

  export interface AdditionalProperties {
    dispalyMessage: string;
    maxRetryCount: string;
  }

  export interface GenericCardWebhookResponse {
    orderId: string;
    channel: string;
    locale: string;
    transactionType: string;
    currencyCode: string;

    authorizationResponse?: AuthorizationResponse;
    captureResponse?: CaptureResponse;
    creditResponse?: CreditResponse;
    voidResponse?: VoidResponse;
  }

  export interface GenericWebhookResponse {
    orderId: string;
    channel: string;
    locale: string;
    transactionType: string;
    currencyCode: string;
    amount: string;
    paymentId: string;
    hostTimestamp: string;
    hostTransactionId: string;
    merchantTransactionId: string;

    response: WebhookGenericResponse;
    additionalProperties?: WebhookAdditionalProperties;
  }

  export type GenericPaymentWebhookResponse = GenericCardWebhookResponse | GenericWebhookResponse;

  export interface ErrorResponse {
    /**
     * An optional non-localized message containing technical information for developers
     */
    devMessage?: string;
    /**
     * The numerical code identifying the error
     */
    errorCode?: string;
    /**
     * An optional list of errors if multiple errors were encountered
     */
    errors?: ErrorDetails[];
    /**
     * The localized message describing the error
     */
    message: string;
    /**
     * An optional non-localized message with more information
     */
    moreInfo?: string;
    /**
     * An optional machine readable description of where the error occurred
     */
    'o:errorPath'?: string;
    /**
     * The HTTP status code
     */
    status: number;
    /**
     * The URI to the HTTP state code definition
     */
    type?: string;
  }

  export interface ErrorDetails {
    /**
     * An optional non-localized message containing technical information for developers
     */
    devMessage?: string;
    /**
     * The numerical code identifying the error
     */
    errorCode?: string;
    /**
     * The localized message describing the error
     */
    message?: string;
    /**
     * An optional non-localized message with more information
     */
    moreInfo?: string;
    /**
     * An optional machine readable description of where the error occurred
     */
    'o:errorPath'?: string;
    /**
     * The HTTP status code
     */
    status?: string;
  }

  export interface RefundPaymentRequest {
    merchantReferenceNumber: string;
    transactionId: string;
    currency: string;
    amount: string;
  }

  export interface RefundPaymentResponse {
    hostTransactionTimestamp: string;
    amount: string;
    responseCode: string;
    responseReason: string;
    merchantTransactionId: string;
    hostTransactionId: string;
    merchantTransactionTimestamp: string;
  }

  export interface ConversionInfo {
    merchantReferenceCode: string;
    newDecision: string;
    originalDecision: string;
  }
}

declare namespace Express {
  export interface Request {
    rawBody: string;
  }
}
