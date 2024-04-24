# Decision Manager <!-- omit in toc -->

1. [Description](#description)
2. [Implementation Details](#implementation-details)
3. [Collecting Device Fingerprint](#collecting-device-fingerprint)
   1. [UI integration details](#ui-integration-details)
   2. [Backend (SSE) integration details](#backend-sse-integration-details)

## Description

Decision Manager is a hosted fraud management solution that enables to take a pre-emptive approach to fraud management - stopping fraud closer to its inception while increasing conversion of good orders. Decision Manager accesses the world's largest fraud detection radar, a rules engine, a case management system, as well as reporting and analytics. For more details, please refer to [Fraud and risk management](https://www.cybersource.com/en-ap/solutions/fraud-and-risk-management.html) documentation.

Please refer to the "Payment Fraud Detection" section of the [Payment Integration with Oracle Commerce Cloud](https://community.oracle.com/docs/DOC-1032741#jive_content_id_Payment_Fraud_Detection) document.

## Implementation Details

According to [Payment with Add-On Features](https://developer.cybersource.com/api/authorization-add-ons.html#ADM)

> For a Merchant Account(MID) that is enabled for Decision Manager should receive Decision Manager specific fields in the Payments API response. There is no explicit field or action required to trigger Decision Manager with Payments API call.Note: If you MID is enabled for Decision Manager, Please contact your Cybersource representative.

Having DM enabled for your MID does not require any configuration in gateway settings or SSE. It is managed by PSP.

In case you would like [disable DM checks](https://developer.cybersource.com/api/authorization-add-ons.html#ASDM) for a particular payment method please specify methods to skip in the `dmDecisionSkip` gateway setting. The following SSE component implements DM skip logic `packages/server-extension/src/services/payments/converters/request/mappers/decisionManagerMapper.ts`

In case DM is enabled for a particular payment method and transaction is marked for Review authorization is still considered successfully from OCC standpoint. Webhook response code will still be '1000' and additional response reason (`AUTHORIZED_PENDING_REVIEW`) will be returned back to OCC so that interested parties (e.g. OMS) can detect such transaction in OCC being marked for review.

In case DM is enabled for a particular payment method and transaction is rejected after authorization with response reason(`AUTHORIZED_RISK_DECLINED`).Authorization Reversal will be triggered automatically. 


From the referenced document we can follow the recommended approach for `Review` decisions:

1. A shopper enters card information and submits the order
2. OCC processes the order and triggers the payment webhook with transaction type “Authorize” to request authorization for the order
3. The Payment Integration Service receives this request and can function as the integration point for fraud detection
4. The Payment Integration Service invokes the fraud detection service along with authorization
5. If the payment provider authorizes the order the payment integration service should return an approve response to OCC along with a custom property to indicate that manual review is needed
6. OCC submits the order to fulfillment and includes the review property in the payload
7. If a manual review is needed fulfillment can be delayed until that review is successfully completed
8. The fulfillment can check with PSP if Review status has been resolved. SSE [Reporting API](#reporting) can be used to get list of transactions with resolved review status
9. If the manual review rejects the order the order must be canceled, the payment voided or refunded, and the shopper notified accordingly

## Collecting Device Fingerprint

Device fingerprint is a set of additional data attributes collected from the shopper's device. The fingerprint can be a link to additional information about the customer's computer.The collected information can be used to tune DM case rules to tune risk management for authorization transactions.

The following gateway settings apply for device fingerprint

| **Setting**                  | **Description**                                            |
|------------------------------|------------------------------------------------------------|
| **deviceFingerprintEnabled** | Enable Device Fingerprint                                  |
| **deviceFingerprintUrl**     | Device Fingerprint URL                                     |
| **deviceFingerprintOrgId**   | Device Fingerprint Organization ID. Get the value from PSP |

Device fingerprint is enabled by the `deviceFingerprintEnabled` setting and applies to all payment types

### Backend (SSE) integration details

In the table below you can find related codebase artifacts for handling device fingerprint logic:

| **Location**                                                                                            | **Description**                                        |
|---------------------------------------------------------------------------------------------------------|--------------------------------------------------------|
| `packages/server-extension/src/services/payments/converters/request/mappers/deviceFingerprintMapper.ts` | Include device fingerprint id in authorization request |
| `packages/server-extension/src/services/payments/validators/deviceFingerprintSessionIdValidator.ts`     | Ensure fingerprint id has not been tampered in UI      |
