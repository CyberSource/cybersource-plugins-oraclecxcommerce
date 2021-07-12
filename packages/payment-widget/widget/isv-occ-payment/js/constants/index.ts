export const BASE_API_HOST = process.env.BASE_API_HOST ?? '';
export const BASE_API_URL = process.env.BASE_API_URL ?? '/ccstorex/custom/isv-payment/v1';

export enum Channels {
  PREVIEW = 'preview',
  STOREFRONT = 'storefront'
}
