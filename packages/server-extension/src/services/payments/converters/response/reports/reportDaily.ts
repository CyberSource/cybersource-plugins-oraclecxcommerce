import xml2js from 'xml2js';
const { LogFactory } = require('@isv-occ-payment/occ-payment-factory');

export async function createDailyReportResponse(xmlReport: string): Promise<OCC.ConversionInfo[]> {
  const parser = new xml2js.Parser();
  const report = await parser.parseStringPromise(xmlReport);
  const logger = LogFactory.logger();
  const reportData = report.Report?.Conversion?.map(conversionToConversionInfo) || [];
  !reportData.length && logger.error(report.errorBean?.message);

  return reportData;
}

function conversionToConversionInfo(item: any): OCC.ConversionInfo {
  return {
    merchantReferenceCode: item.$.MerchantReferenceNumber,
    newDecision: item.NewDecision?.join(),
    originalDecision: item.OriginalDecision?.join()
  };
}
