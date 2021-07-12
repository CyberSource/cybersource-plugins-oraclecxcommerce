import { Request, Response } from 'express';
import fetch from 'node-fetch';
import orderToWebhook from './converters/orderRequestToWebhook';
import webhookToOrderResponse from './converters/webhookToOrderResponse';

const headers = {
  'Content-Type': 'application/json'
};

export default async function createOrder(req: Request, res: Response) {
  const webhookRequest = orderToWebhook(req);

  return fetch('http://localhost:3000/ccstorex/custom/isv-payment/v1/payments', {
    method: 'post',
    body: JSON.stringify(webhookRequest),
    headers
  })
    .then((webhookResponse) => webhookResponse.json())
    .then((jsonResponse) => webhookToOrderResponse(jsonResponse))
    .then((result) => res.json(result))
    .catch((err) => res.json(err));
}
