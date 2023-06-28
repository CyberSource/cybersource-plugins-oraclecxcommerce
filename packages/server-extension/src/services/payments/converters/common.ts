import { PaymentContext } from '@server-extension/common';
import { CreatePaymentRequest } from 'cybersource-rest-client';
import { all } from 'deepmerge';

export interface Mapper<T> {
  supports(context: PaymentContext): boolean;

  map(context: PaymentContext): DeepPartial<T>;
}

export type PaymentRequestMapper = Mapper<CreatePaymentRequest>;
export type PaymentResponseMapper = Mapper<OCC.GenericPaymentWebhookResponse>;

function objectMapper<T>(partial: DeepPartial<T>): Mapper<T> {
  return {
    supports: (_context: PaymentContext) => true,
    map: (_context: PaymentContext) => partial
  };
}

const merge = (...objects: any[]) => <any>all(objects);

export function applyMapping<T>(mappers: Mapper<T>[], context: PaymentContext): DeepPartial<T> {
  return mappers
    .filter((mapper) => mapper.supports(context))
    .map((mapper) => mapper.map(context)).reduce((first, second) => merge(first, second), {});
}

export type MapperLike<T> = Mapper<T> | DeepPartial<T> | T;

export function convert<T>(context: PaymentContext, ...mappers: any /*MapperLike<T>[]*/): T {
  return <T>applyMapping(
    mappers.map((mapper: DeepPartial<T>) => ('supports' in mapper ? mapper : objectMapper(mapper))),
    context
  );
}
