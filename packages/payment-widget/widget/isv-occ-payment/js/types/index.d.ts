/// <reference types="@isv-occ-payment/occ-mock-storefront/src/types" />

declare namespace OCC {
  export interface Config {
    flexSdkUrl: string;

    payerAuthEnabled: boolean;
    songbirdUrl: string;

    googlePaySdkUrl: string;
    googlePayEnvironment: 'TEST' | 'PRODUCTION';
    googlePayGateway: string;
    googlePayGatewayMerchantId: string;
    googlePayMerchantId: string;
    googlePayMerchantName: string;
    googlePaySupportedNetworks: string;

    applePaySupportedNetworks: string;

    [index: string]: string | boolean;
  }

  export interface DeviceFingerprintConfig {
    deviceFingerprintEnabled: boolean;
    deviceFingerprintUrl: string;
    deviceFingerprintOrgId: string;
    deviceFingerprintData: DeviceFingerprintData;
  }

  export interface PaymentMethod {
    type: string;
    config?: Config;
  }

  export interface PaymentMethodResponse {
    paymentMethods: PaymentMethod[];
    deviceFingerprint: DeviceFingerprintConfig;
  }

  export interface EncryptedText {
    encrypted: string;
    iv: string;
  }

  export interface CaptureContext {
    captureContext: string;
    cipher: EncryptedText;
  }

  export interface DeviceFingerprintData {
    sessionId: string;
    cipher: EncryptedText;
  }

  export interface PayerAuthJwt {
    jwt: string;
  }

  export interface ApplePaySessionData {
    session: any;
  }
}
