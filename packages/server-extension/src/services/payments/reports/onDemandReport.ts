import { RequestContext } from '@server-extension/common';
import {
  ConversionDetailsApi,
  ReportingV3ConversionDetailsGet200Response
} from 'cybersource-rest-client';
import makeRequest from '../api/paymentCommand';
import { createOnDemandReportResponse } from '../converters/response/reports';
import { getOnDemandInterval } from './intervalService';

export async function getOnDemandReport(
  requestContext: RequestContext,
  start?: Date,
  end?: Date
): Promise<OCC.ConversionInfo[]> {
  const { startDate, endDate } = getOnDemandInterval(start, end);
  const organizationId = requestContext.gatewaySettings.merchantID;

  try {
    const res = await makeRequest<ReportingV3ConversionDetailsGet200Response>(
      requestContext.merchantConfig,
      ConversionDetailsApi,
      'getConversionDetail',
      startDate.toISOString(),
      endDate.toISOString(),
      organizationId
    );

    return createOnDemandReportResponse(res);
  } catch (er) {
    if (er.status == 404) {
      return [];
    } else {
      throw er;
    }
  }
}
