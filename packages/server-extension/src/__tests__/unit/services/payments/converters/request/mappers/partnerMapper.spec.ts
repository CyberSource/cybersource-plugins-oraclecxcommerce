import { PaymentContext } from '@server-extension/common';
import { partnerMapper } from '@server-extension/services/payments/converters/request/mappers';
import { mockDeep, mockReset } from 'jest-mock-extended';
import nconf from 'nconf';
import { mocked } from 'ts-jest/utils';

jest.mock('nconf');

const developerId = 'developerId';
const solutionId = 'solutionId';

describe('Converters - Partner Mapper', () => {
  const context = mockDeep<PaymentContext>();

  beforeEach(() => {
    mockReset(context);
  });

  it.each`
    developerId    | solutionId    | supported
    ${developerId} | ${solutionId} | ${true}
    ${developerId} | ${''}         | ${false}
    ${''}          | ${solutionId} | ${false}
    ${''}          | ${''}         | ${false}
  `(
    "Should map only when configuration values (developerId:'$developerId', solutionId:'$solutionId') are available",
    ({ developerId, solutionId, supported }) => {
      mocked(nconf.get).mockReturnValueOnce(developerId).mockReturnValueOnce(solutionId);

      expect(partnerMapper.supports(context)).toEqual(supported);
    }
  );

  it('Should map partner information', () => {
    mocked(nconf.get).mockReturnValueOnce(developerId).mockReturnValueOnce(solutionId);

    expect(partnerMapper.map(context)).toMatchObject({
      clientReferenceInformation: {
        partner: {
          developerId,
          solutionId
        }
      }
    });
  });
});
