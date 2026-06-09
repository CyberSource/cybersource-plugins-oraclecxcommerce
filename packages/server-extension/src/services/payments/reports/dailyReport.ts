import { RequestContext } from '@server-extension/common';
import { ReportDownloadsApi } from 'cybersource-rest-client';
import crypto from 'crypto';
import fs from 'fs';
import nconf from 'nconf';
import path from 'path';
import { makeRequestWithConfigurableClient } from '../api/paymentCommand';
import { createDailyReportResponse } from '../converters/response/reports';

const DOWNLOAD_PATH = nconf.get('report.daily.download.path') ?? path.join(__dirname, './data');

function ensureDownloadDirectory() {
  if (!fs.existsSync(DOWNLOAD_PATH)) {
    fs.mkdirSync(DOWNLOAD_PATH, { recursive: true });
  }
}

export async function getDailyReport(date: Date, requestContext: RequestContext) {
  const { gatewaySettings } = requestContext;
  const reportName = gatewaySettings.dailyReportName || 'ConversionDetailReport_Daily_Classic';

  // Generate unique file paths per request to prevent race conditions
  const uniqueId = crypto.randomUUID();
  const reportFileName = `dailyReport_${uniqueId}`;
  const reportFilePath = path.join(DOWNLOAD_PATH, `${reportFileName}.xml`);
  const downloadFilePath = path.join(DOWNLOAD_PATH, reportFileName);

  ensureDownloadDirectory();

  try {
    // Download report to unique file path using a per-request ApiClient
    // This prevents race conditions between concurrent report downloads
    await makeRequestWithConfigurableClient(
      requestContext.merchantConfig,
      ReportDownloadsApi,
      'downloadReport',
      (apiClient) => {
        // Configure the ApiClient with the unique download path for this request
        apiClient.downloadFilePath = downloadFilePath;
      },
      date.toISOString().slice(0, 10),
      reportName,
      gatewaySettings.merchantID
    );

    // Read and parse the report
    return await getXmlReportConversionInfo(reportFilePath);
  } finally {
    // Clean up temporary file after processing
    if (fs.existsSync(reportFilePath)) {
      try {
        fs.unlinkSync(reportFilePath);
      } catch (cleanupError) {
        // Log cleanup error but don't fail the request
        console.error(`Failed to clean up temporary report file: ${reportFilePath}`, cleanupError);
      }
    }
  }
}

function getXmlReportConversionInfo(filePath: string): Promise<OCC.ConversionInfo[]> {
  const file = fs.readFileSync(filePath, 'utf-8');

  return createDailyReportResponse(file);
}
