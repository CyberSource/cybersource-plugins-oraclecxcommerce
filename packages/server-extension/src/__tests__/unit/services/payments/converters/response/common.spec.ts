import {
  pspResponseTypeMappings,
  responseCodeMappings,
  twelveDigits
} from '@server-extension/services/payments/converters/response/common';

describe('Converters - Responses', () => {
  it.each`
    status                         | type      | code
    ${'AUTHORIZED'}                | ${'0100'} | ${'1000'}
    ${'AUTHORIZED_PENDING_REVIEW'} | ${'0100'} | ${'1000'}
    ${'PENDING_AUTHENTICATION'}    | ${'0100'} | ${'10000'}
    ${'REVERSED'}                  | ${'0110'} | ${'2000'}
    ${'PENDING'}                   | ${'0200'} | ${'11000'}
    ${'PENDING'}                   | ${'0400'} | ${'3000'}
    ${'SALE_COMPLETE'}             | ${'0100'} | ${'4000'}
    ${'DECLINED'}                  | ${'0100'} | ${'9000'}
    ${'DECLINED'}                  | ${'0110'} | ${'8000'}
    ${'DECLINED'}                  | ${'0200'} | ${'12000'}
    ${'DECLINED'}                  | ${'0400'} | ${'7000'}
    ${'DECLINED'}                  | ${'1111'} | ${'9000'}
    ${'INVALID_REQUEST'}           | ${'0100'} | ${'9000'}
  `('Should return response code: $code for payment status: $status', ({ status, type, code }) => {
    expect(responseCodeMappings(status, type)).toBe(code);
  });

  it.each`
    code      | type
    ${'0100'} | ${'authorizationResponse'}
    ${'0200'} | ${'captureResponse'}
    ${'0400'} | ${'creditResponse'}
    ${'0110'} | ${'voidResponse'}
  `('Should return psp response type: $type for code: $code', ({ code, type }) => {
    expect(pspResponseTypeMappings[code]).toBe(type);
  });

  it('Should return 12-digit number from string amount', () => {
    const amount = '122';

    expect(twelveDigits(amount)).toBe('000000000122');
  });
});
