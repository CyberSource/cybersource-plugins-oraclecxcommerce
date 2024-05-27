import { PaymentContext } from '@server-extension/common';
import { convert, MapperLike } from '../common';
import { partnerMapper } from './mappers';

export const WEBHOOK_SUBSCRIPTION = {
  CREATE :  'CREATE',
  ENDPOINT: '/ccstorex/custom/isv-payment/v2/webhook/tokenUpdate',
  KEY_TYPE: 'sharedSecret',
  PROVIDER: 'nrtd',
  WEBHOOK_NAME: "Webhook URL for token updates",
  WEBHOOK_DESCRIPTION: "Webhook to receive Network Token life cycle updates",
  PRODUCT_ID: "tokenManagement",
  EVENT_TYPE: "tms.networktoken.updated",
  SECURITY_TYPE: "KEY",
  PROXY_TYPE: "external",
  PORT: "443",
  NETWORK_TOKENS_EXTENSION_VARIABLE : "IsvNetworkTokenConfigurations"
}

export const twoDecimal = (amount: string): string => {
  const amountInt = parseInt(amount);
  return (amountInt / 100).toFixed(2);
};

export const cardTypeMappings = (type: string): string => {
  const mapping: Record<string, string> = {
    visa: '001',
    mastercard: '002',
    amex: '003',
    discover: '004',
    diners: '005',
    jcb: '007',
    elo: '054',
    dankort: '034',
    cartebleue: '036',
    cartasi: '037'
  };

  return mapping[type.toLowerCase()];
};

export function convertRequest<T>(context: PaymentContext, ...mappers: MapperLike<T>[]): T {
  return <T>convert(context, partnerMapper, ...mappers);
};
