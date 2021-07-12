import { PaymentContext } from '@server-extension/common';
import { convert, MapperLike } from '../common';
import { partnerMapper } from './mappers';

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
}
