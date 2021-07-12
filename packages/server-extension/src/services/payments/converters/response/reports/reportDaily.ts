import xml2js from 'xml2js';

export async function createDailyReportResponse(xmlReport: string): Promise<OCC.ConversionInfo[]> {
  const parser = new xml2js.Parser();
  const report = await parser.parseStringPromise(xmlReport);

  return report.Report.Conversion?.map(conversionToConversionInfo) || [];
}

function conversionToConversionInfo(item: any): OCC.ConversionInfo {
  return {
    merchantReferenceCode: item.$.MerchantReferenceNumber,
    newDecision: item.NewDecision?.join(),
    originalDecision: item.OriginalDecision?.join()
  };
}
