import { getCorrectedDate, getDatePlusDays } from '@server-extension/services/payments/reports';
import { sendDailyReportRequest, sendOnDemandReportRequest, verifyErrorPaths } from '../common';

const REQUEST_VALIDATION_FAILED = 'Request validation has failed. Please check your input';

describe('Reports', () => {
  //Requires a reviewed transaction in the last day
  it.skip('Should generate daily report', async () => {
    const res = await sendDailyReportRequest(getDatePlusDays(-1)).expect(200);

    expect(res.body).toMatchObject([
      {
        merchantReferenceCode: 'o30446',
        newDecision: 'ACCEPT',
        originalDecision: 'REVIEW'
      }
    ]);
  });

  //Requires a reviewed transaction in the last day
  it.skip('Should generate on demand report', async () => {
    const startDate = getDatePlusDays(-1).toISOString();
    const endDate = getCorrectedDate(new Date(), -1).toISOString();

    const res = await sendOnDemandReportRequest(startDate, endDate).expect(200);

    expect(res.body).toMatchObject([
      {
        merchantReferenceCode: 'o30446',
        newDecision: 'ACCEPT',
        originalDecision: 'REVIEW'
      }
    ]);
  });

  it('Should return empty array when on demand report is not found', async () => {
    const startDate = getCorrectedDate(new Date(), -10).toISOString();
    const endDate = getCorrectedDate(new Date(), -1).toISOString();

    const res = await sendOnDemandReportRequest(startDate, endDate).expect(200);

    expect(res.body).toMatchObject([]);
  });

  it('Should return empty array when no endDate provided and report not found', async () => {
    const startDate = getCorrectedDate(new Date(), -10).toISOString();

    const res = await sendOnDemandReportRequest(startDate).expect(200);

    expect(res.body).toMatchObject([]);
  });

  it('Should fail validation for daily report when date is missing', async () => {
    const res = await sendDailyReportRequest(undefined).expect(400);

    const expectedErrorPaths = ['query:date', 'query:date'];
    verifyErrorPaths(res.body.errors, expectedErrorPaths);
    expect(res.body).toMatchObject({
      status: 400,
      message: REQUEST_VALIDATION_FAILED
    });
  });

  it('Should fail validation for daily report when date is not in the past', async () => {
    const res = await sendDailyReportRequest(getDatePlusDays(1)).expect(400);

    const expectedErrorPaths = ['query:date'];
    verifyErrorPaths(res.body.errors, expectedErrorPaths);
    expect(res.body).toMatchObject({
      status: 400,
      message: REQUEST_VALIDATION_FAILED
    });
  });

  it('Should fail validation for daily report when date is not valid', async () => {
    const res = await sendDailyReportRequest('WRONG').expect(400);

    const expectedErrorPaths = ['query:date', 'query:date'];
    verifyErrorPaths(res.body.errors, expectedErrorPaths);
    expect(res.body).toMatchObject({
      status: 400,
      message: REQUEST_VALIDATION_FAILED
    });
  });

  it('Should fail validation for on demand report when startDate is not in the past', async () => {
    const res = await sendOnDemandReportRequest(getDatePlusDays(1).toISOString()).expect(400);

    const expectedErrorPaths = ['query:startTime'];
    verifyErrorPaths(res.body.errors, expectedErrorPaths);
    expect(res.body).toMatchObject({
      status: 400,
      message: REQUEST_VALIDATION_FAILED
    });
  });

  it('Should fail validation for on demand report when startDate is not valid date', async () => {
    const res = await sendOnDemandReportRequest('WRONG').expect(400);

    const expectedErrorPaths = ['query:startTime', 'query:startTime'];
    verifyErrorPaths(res.body.errors, expectedErrorPaths);
    expect(res.body).toMatchObject({
      status: 400,
      message: REQUEST_VALIDATION_FAILED
    });
  });

  it('Should fail validation for on demand report when endDate is not in the past', async () => {
    const startDate = getDatePlusDays(-1).toISOString();
    const endDate = getDatePlusDays(1).toISOString();

    const res = await sendOnDemandReportRequest(startDate, endDate).expect(400);

    const expectedErrorPaths = ['query:endTime'];
    verifyErrorPaths(res.body.errors, expectedErrorPaths);
    expect(res.body).toMatchObject({
      status: 400,
      message: REQUEST_VALIDATION_FAILED
    });
  });

  it('Should fail validation for on demand report when endDate is not valid date', async () => {
    const startDate = getDatePlusDays(-1).toISOString();
    const endDate = 'WRONG';

    const res = await sendOnDemandReportRequest(startDate, endDate).expect(400);

    const expectedErrorPaths = ['query:startTime', 'query:endTime', 'query:endTime'];
    verifyErrorPaths(res.body.errors, expectedErrorPaths);
    expect(res.body).toMatchObject({
      status: 400,
      message: REQUEST_VALIDATION_FAILED
    });
  });

  it('Should fail validation for on demand report when startDate is not before endDate', async () => {
    const startDate = getDatePlusDays(-1).toISOString();
    const endDate = getDatePlusDays(-2).toISOString();

    const res = await sendOnDemandReportRequest(startDate, endDate).expect(400);

    const expectedErrorPaths = ['query:startTime'];
    verifyErrorPaths(res.body.errors, expectedErrorPaths);
    expect(res.body).toMatchObject({
      status: 400,
      message: REQUEST_VALIDATION_FAILED
    });
  });

  it('Should fail validation for on demand report when time range is greater than 24h', async () => {
    const now = new Date();
    const startDate = getDatePlusDays(-3, now).toISOString();
    const endDate = getDatePlusDays(-1, now).toISOString();

    const res = await sendOnDemandReportRequest(startDate, endDate).expect(400);

    const expectedErrorPaths = ['query:endTime'];
    verifyErrorPaths(res.body.errors, expectedErrorPaths);
    expect(res.body).toMatchObject({
      status: 400,
      message: REQUEST_VALIDATION_FAILED
    });
  });
});
