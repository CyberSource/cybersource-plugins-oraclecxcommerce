import {
  ReportingV3ConversionDetailsGet200Response,
  ReportingV3ConversionDetailsGet200ResponseConversionDetails
} from 'cybersource-rest-client';

export function createOnDemandReportResponse(
  reportResponse: ReportingV3ConversionDetailsGet200Response
): OCC.ConversionInfo[] {
  return reportResponse.conversionDetails?.map(conversionDetailsToConversionInfo) || [];
}

function conversionDetailsToConversionInfo(
  details: ReportingV3ConversionDetailsGet200ResponseConversionDetails
): OCC.ConversionInfo {
  return {
    merchantReferenceCode: details.merchantReferenceNumber ?? '',
    newDecision: details.newDecision ?? '',
    originalDecision: details.originalDecision ?? ''
  };
}
