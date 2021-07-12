import { createOnDemandReportResponse } from '@server-extension/services/payments/converters/response/reports';

describe('On Demand Report Converter', () => {
  it('Should create ConversionInfo using the provided data', async () => {
    const res = await createOnDemandReportResponse(reportResponse);

    expect(res).toMatchObject([
      {
        merchantReferenceCode: 'o30446',
        newDecision: 'ACCEPT',
        originalDecision: 'REVIEW'
      }
    ]);
  });

  it('Should return empty array if no conversion details available', async () => {
    reportResponse.conversionDetails = [];

    const res = await createOnDemandReportResponse(reportResponse);

    expect(res).toMatchObject([]);
  });
});

const reportResponse = {
  conversionDetails: [
    {
      merchantReferenceNumber: 'o30446',
      conversionTime: new Date(),
      requestId: '5991305961146275004002',
      originalDecision: 'REVIEW',
      newDecision: 'ACCEPT'
    }
  ],
  endTime: new Date(),
  organizationId: 'orgId',
  startTime: new Date()
};
