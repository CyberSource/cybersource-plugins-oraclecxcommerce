import { createDailyReportResponse } from '@server-extension/services/payments/converters/response/reports';

describe('Daily Report Converter', () => {
  it('Should create ConversionInfo using the provided data', async () => {
    const res = await createDailyReportResponse(xmlReport);

    expect(res).toMatchObject([
      {
        merchantReferenceCode: 'o30446',
        newDecision: 'ACCEPT',
        originalDecision: 'REVIEW'
      }
    ]);
  });

  it('Should return empty array if no conversion details available', async () => {
    const res = await createDailyReportResponse(emptyXmlReport);

    expect(res).toMatchObject([]);
  });
});

const xmlReport = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE Report SYSTEM "https://api.cybersource.com/reporting/v3/dtds/cdr">
<Report Name="Conversion Detail Report" 
        Version="1.1" 
        xmlns="https://api.cybersource.com/reporting/v3/dtds/cdr" 
        MerchantID="merchantId" 
        ReportStartDate="2020-09-01T00:00:00Z+00:00" 
        ReportEndDate="2020-09-02T00:00:00Z+00:00">
  <Conversion ConversionDate="2020-09-01T09:33:32Z" MerchantReferenceNumber="o30446" RequestID="5989527246246071604002">
    <NewDecision>ACCEPT</NewDecision>
    <OriginalDecision>REVIEW</OriginalDecision>
    <Profile>Example</Profile>
    <Queue>Example</Queue>
    <Reviewer>admin</Reviewer>
    <ReviewerComments>comment</ReviewerComments>
  </Conversion>
</Report>`;

const emptyXmlReport = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE Report SYSTEM "https://api.cybersource.com/reporting/v3/dtds/cdr">
<Report Name="Conversion Detail Report" 
        Version="1.1" 
        xmlns="https://api.cybersource.com/reporting/v3/dtds/cdr" 
        MerchantID="merchantId" 
        ReportStartDate="2020-09-01T00:00:00Z+00:00" 
        ReportEndDate="2020-09-02T00:00:00Z+00:00">
</Report>`;
