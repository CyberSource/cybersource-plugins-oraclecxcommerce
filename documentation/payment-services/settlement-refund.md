# Settlement and Refund <!-- omit in toc -->

According to the [Implementation Consideration](https://community.oracle.com/docs/DOC-1032741#jive_content_id_Settlement) section in the [Payment Integration with Oracle Commerce Cloud](https://community.oracle.com/docs/DOC-1032741) document:
> Orders can be settled either at fulfillment or at the time of authorization.  Settling at fulfillment allows the merchant to settle for a different amount than authorized.  This is useful if some items cannot be fulfilled.  The merchant can simply settle the order for the cost of items that were fulfilled and let the balance of the authorization expire.
>
> Some merchants may choose to settle orders at the time of authorization or support payment methods that capture funds (settle) at the time of payment.  Those merchants must ensure that they issue refunds if the order or some part of it cannot be fulfilled or the order is canceled. Refunding orders that are partially fulfilled or cannot be fulfilled is the responsibility of the merchant and should be done by the fulfillment system.  Orders that are canceled within OCC automatically invoke the  genericPayment webhook with “void” transaction type if the order was authorized only or “refund” if settled.

Custom Payment Integration Service can provide and option (using `saleEnabled` gateway setting) to capture payment during "authorization". Merchants can enable SALE for a particular payment type in OCC Admin. In this case settlement will happen at the time of authorization.

In case merchants decide to settle authorization or issue a refund at fulfillment (e.g. using OMS) SSE exposes two additional endpoints to help with the process:

- `/ccstorex/custom/isv-payment/v2/capture` - Settle authorization for a given authorization transaction id
- `/ccstorex/custom/isv-payment/v2/refund` - Refund settled transaction for a given transaction id

**Note:** Services triggered using OMS will not be updated in OCC

Each endpoint accepts the the following parameters:

- `currency` - Currency ISO code (three  characters long, uppercase)
- `transactionId` - Source transaction id. For settlement its originating authorization transaction, for refund - settlement
- `amount` - Amount to be settled or refunded. Accepts same number format as amounts in Webhook requests
- `merchantReferenceNumber` - Order ID

Please inspect requests named 'Payment Capture' and 'Payment Refund' in the Postman collection located at `packages/server-extension/docs/isv-occ-payment.postman_collection.json`

In the table below you can find related codebase artifacts for handling capture  and refunds:

| **Location**                                                                   | **Description**                        |
|--------------------------------------------------------------------------------|----------------------------------------|
| `packages/server-extension/src/controllers/paymentCapture.ts`                  | Controller handling capture requests   |
| `packages/server-extension/src/controllers/validation/capturePaymentSchema.ts` | Validation schema for capture requests |
| `packages/server-extension/src/controllers/paymentRefund.ts`                   | Controller handling refund requests    |
| `packages/server-extension/src/controllers/validation/refundPaymentSchema.ts`  | Validation schema for refund requests  |
