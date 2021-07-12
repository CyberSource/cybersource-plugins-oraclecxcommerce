import { PaymentContext } from '@server-extension/common';
import { convert, Mapper } from '@server-extension/services/payments/converters/common';
import { mockDeep } from 'jest-mock-extended';

interface TestPartial {
  foo: string;
  bar: number;
  rest: number;
}

const partial1 = {
  foo: 'partial1'
};

const partial2 = {
  bar: 1
};

const partial3 = {
  foo: 'partial3',
  rest: 4
};

const mapper = <Mapper<TestPartial>>{
  supports: (_context: PaymentContext) => true,
  map: (_context: PaymentContext) => ({
    foo: 'mapper'
  })
};

describe('Converters - Common', () => {
  const context = mockDeep<PaymentContext>();
  it('should convert objects by merging all partials and evaluating mappers', () => {
    expect(convert<TestPartial>(context, partial1, partial2, partial3)).toEqual(
      expect.objectContaining({
        foo: 'partial3',
        bar: 1,
        rest: 4
      })
    );

    expect(convert<TestPartial>(context, partial3, partial1)).toEqual(
      expect.objectContaining({
        foo: 'partial1',
        rest: 4
      })
    );

    expect(convert<TestPartial>(context, partial1, partial2, mapper)).toEqual(
      expect.objectContaining({
        foo: 'mapper',
        bar: 1
      })
    );

    expect(convert<TestPartial>(context, mapper, partial1, partial3)).toEqual(
      expect.objectContaining({
        foo: 'partial3',
        rest: 4
      })
    );
  });
});
