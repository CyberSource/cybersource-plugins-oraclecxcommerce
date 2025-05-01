import occClient from '@server-extension/services/occ/occClient';
import buildPaymentContext from '@server-extension/services/payments/paymentContextBuilder';
import { Request, Response } from 'express';
import {RequestContext} from '@server-extension/common';

async function findHostTransactionID(orderId: string, paymentId: string,requestContext: RequestContext) {
  const orderData = await occClient.getOrder(orderId,requestContext?.siteId);
  return getDebitTransactionId(orderData, paymentId) ?? getAuthTransactionId(orderData, paymentId);
}

function getAuthTransactionId(orderData: OCC.OrderDataResponse, pgId: string) {
  return getTransactionId(orderData, 'authorizationStatus', 'AUTHORIZED', pgId);
}

function getDebitTransactionId(orderData: OCC.OrderDataResponse, pgId: string) {
  return getTransactionId(orderData, 'debitStatus', 'SETTLED', pgId);
}

function getTransactionId(
  orderData: OCC.OrderDataResponse,
  statusField: 'authorizationStatus' | 'debitStatus',
  pgState: 'AUTHORIZED' | 'SETTLED',
  pgId: string
) {
  return orderData.paymentGroups
    .find(({ id, state }) => state === pgState && id === pgId)
    ?.[statusField]?.find((status) => status.transactionSuccess)?.statusProps.hostTransactionId;
}

export default async function referenceInfoFallback(req: Request, res: Response) {
  const context = buildPaymentContext(req);
  const requestContext: RequestContext = req.app.locals;
  const { webhookRequest } = context;
  const { orderId, paymentId, referenceInfo } = webhookRequest;

  if (!referenceInfo?.hostTransactionId) {
    webhookRequest.referenceInfo = {
      ...referenceInfo,
      ...{ hostTransactionId: await findHostTransactionID(orderId, paymentId,requestContext) }
    };
  }
}
