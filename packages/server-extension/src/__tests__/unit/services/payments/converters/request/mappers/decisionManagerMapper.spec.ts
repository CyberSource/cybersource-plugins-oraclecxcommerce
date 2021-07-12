import { PaymentContext } from '@server-extension/common';
import { decisionManagerMapper } from '@server-extension/services/payments/converters/request/mappers';
import { mockDeep, mockReset } from 'jest-mock-extended';

describe('Converters - Request Mappers', () => {
  const context = mockDeep<PaymentContext>();

  beforeEach(() => {
    mockReset(context);
  });

  it.each`
    dmDecisionSkip | skip
    ${true}        | ${true}
    ${false}       | ${false}
  `('should return $skip when dmDecisionSkip is $dmDecisionSkip', ({ dmDecisionSkip, skip }) => {
    context.isValidForPaymentMode.mockImplementation(() => dmDecisionSkip);

    expect(decisionManagerMapper.supports(context)).toBe(skip);
  });

  it('Should return Skip Decision Manager action', () => {
    const mappedRequest = decisionManagerMapper.map(context);

    expect(mappedRequest).toMatchObject({
      processingInformation: {
        actionList: ['DECISION_SKIP']
      }
    });
  });
});
