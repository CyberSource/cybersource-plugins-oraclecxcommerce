import { RequestContext } from '@server-extension/common';
import makeRequest from '@server-extension/services/payments/api/paymentCommand';
import { createOnDemandReportResponse } from '@server-extension/services/payments/converters/response/reports';
import {
  getOnDemandInterval,
  getOnDemandReport
} from '@server-extension/services/payments/reports';
import {
  ConversionDetailsApi,
  MerchantConfig,
  ReportingV3ConversionDetailsGet200Response
} from 'cybersource-rest-client';
import { mock, mockDeep } from 'jest-mock-extended';
import { mocked } from 'ts-jest/utils';

jest.mock('cybersource-rest-client');
jest.mock('@server-extension/services/payments/api/paymentCommand');
jest.mock('@server-extension/services/payments/converters/response/reports');
jest.mock('path');
jest.mock('fs');

describe('Report Service', () => {
  it('Should generate on demand report', async () => {
    const requestContext = mock<RequestContext>();
    const gatewaySettings = mockDeep<OCC.GatewaySettings>();
    gatewaySettings.merchantID = 'merchantID';
    const merchConfig = mockDeep<MerchantConfig>();

    requestContext.gatewaySettings = gatewaySettings;
    requestContext.merchantConfig = merchConfig;
    const reportingV3ConversionDetailsGet200Response = mock<
      ReportingV3ConversionDetailsGet200Response
    >();
    mocked(makeRequest).mockResolvedValue(reportingV3ConversionDetailsGet200Response);
    const conversionInfos = mock<OCC.ConversionInfo[]>();
    mocked(createOnDemandReportResponse).mockReturnValue(conversionInfos);
    const startDate = new Date('2020-09-07T07:00:00.000Z');
    const endDate = new Date('2020-09-08T06:00:00.000Z');

    const res = await getOnDemandReport(requestContext, startDate, endDate);

    expect(makeRequest).toBeCalledWith(
      merchConfig,
      ConversionDetailsApi,
      'getConversionDetail',
      '2020-09-07T07:00:00.000Z',
      '2020-09-08T06:00:00.000Z',
      'merchantID'
    );
    expect(createOnDemandReportResponse).toBeCalledWith(reportingV3ConversionDetailsGet200Response);
    expect(res).toMatchObject(conversionInfos);
  });

  it('Should calculate on demand report interval when dates are not provided', async () => {
    const interval = getOnDemandInterval();

    const timeElapsed = interval.endDate.getTime() - interval.startDate.getTime();
    expect(timeElapsed).toBeGreaterThan(23 * 60 * 60 * 1000);
    expect(timeElapsed).toBeLessThan(24 * 60 * 60 * 1000);
  });

  it.each`
    startDate                               | endDate                                 | interval
    ${new Date('2020-09-07T07:00:00.000Z')} | ${new Date('2020-09-07T13:00:00.000Z')} | ${{ startDate: new Date('2020-09-07T07:00:00.000Z'), endDate: new Date('2020-09-07T13:00:00.000Z') }}
    ${new Date('2020-09-06T07:00:00.000Z')} | ${undefined}                            | ${{ startDate: new Date('2020-09-06T07:00:00.000Z'), endDate: new Date('2020-09-07T06:57:00.000Z') }}
    ${undefined}                            | ${new Date('2020-09-07T13:00:00.000Z')} | ${{ startDate: new Date('2020-09-06T13:03:00.000Z'), endDate: new Date('2020-09-07T13:00:00.000Z') }}
    ${new Date('2020-09-07T07:00:00.000Z')} | ${new Date('2020-09-08T06:59:00.000Z')} | ${{ startDate: new Date('2020-09-07T07:00:00.000Z'), endDate: new Date('2020-09-08T06:56:00.000Z') }}
  `(
    'Should calculate on demand report interval for startDate: $startDate, endDate: $endDate, expected: $interval',
    ({ startDate, endDate, interval }) => {
      expect(getOnDemandInterval(startDate, endDate)).toMatchObject(interval);
    }
  );
});
