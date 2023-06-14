import { Request, Response } from 'express';

import { RequestInfo, RequestInit } from 'node-fetch';
const fetch = (url: RequestInfo, init?: RequestInit) => import('node-fetch').then(({ default: fetch }) => fetch(url, init));

import orderToWebhook from './converters/orderRequestToWebhook';
import webhookToOrderResponse from './converters/webhookToOrderResponse';

const headers = {
  'Content-Type': 'application/json'
};

export default async function createOrder(req: Request, res: Response) {
  const webhookRequest = orderToWebhook(req);

  return fetch('http://localhost:3000/ccstorex/custom/isv-payment/v2/payments/generic', {
    method: 'post',
    body: JSON.stringify(webhookRequest),
    headers
  })
    .then((webhookResponse) => webhookResponse.json())
    .then((jsonResponse) => webhookToOrderResponse(jsonResponse))
    .then((result) => res.json(result))
    .catch((err) => res.json(err));
}
