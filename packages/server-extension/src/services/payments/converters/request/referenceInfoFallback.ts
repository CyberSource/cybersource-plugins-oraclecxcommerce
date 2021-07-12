import { middleware, PaymentContext } from '@server-extension/common';
import occClient from '@server-extension/services/occ/occClient';

async function findHostTransactionID(orderId: string, paymentId: string) {
  const orderData = await occClient.getOrder(orderId);

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

async function referenceInfoFallback(context: PaymentContext) {
  const { webhookRequest } = context;
  const { orderId, paymentId, referenceInfo } = webhookRequest;

  if (!referenceInfo?.hostTransactionId) {
    webhookRequest.referenceInfo = {
      ...referenceInfo,
      ...{ hostTransactionId: await findHostTransactionID(orderId, paymentId) }
    };
  }
}

export default middleware(referenceInfoFallback);
