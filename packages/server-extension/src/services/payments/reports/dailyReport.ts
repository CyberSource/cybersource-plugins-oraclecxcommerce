import { RequestContext } from '@server-extension/common';
import { ReportDownloadsApi } from 'cybersource-rest-client';
import fs from 'fs';
import nconf from 'nconf';
import path from 'path';
import makeRequest, { apiClient } from '../api/paymentCommand';
import { createDailyReportResponse } from '../converters/response/reports';

const REPORT_FILE_NAME = 'dailyReport';

const DOWNLOAD_PATH = nconf.get('report.daily.download.path') ?? path.join(__dirname, './data');
const REPORT_FILE_PATH = path.join(DOWNLOAD_PATH, `${REPORT_FILE_NAME}.xml`);
const DOWNLOAD_FILE_PATH = path.join(DOWNLOAD_PATH, REPORT_FILE_NAME);

function ensureReportPaths() {
  !fs.existsSync(DOWNLOAD_PATH) && fs.mkdirSync(DOWNLOAD_PATH);
  fs.existsSync(REPORT_FILE_PATH) && fs.unlinkSync(REPORT_FILE_PATH);
}

export async function getDailyReport(date: Date, requestContext: RequestContext) {
  const { gatewaySettings } = requestContext;
  const reportName = gatewaySettings.dailyReportName || 'ConversionDetailReport_Daily_Classic';

  ensureReportPaths();

  apiClient.downloadFilePath = DOWNLOAD_FILE_PATH;
  await makeRequest(
    requestContext.merchantConfig,
    ReportDownloadsApi,
    'downloadReport',
    date.toISOString().slice(0, 10),
    reportName,
    gatewaySettings.merchantID
  );

  return await getXmlReportConversionInfo();
}

function getXmlReportConversionInfo(): Promise<OCC.ConversionInfo[]> {
  const file = fs.readFileSync(REPORT_FILE_PATH, 'utf-8');

  return createDailyReportResponse(file);
}
