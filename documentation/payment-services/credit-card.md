# Credit Card <!-- omit in toc -->

1. [Description](#description)
2. [Implementation Details](#implementation-details)
   1. [Configuration](#configuration)
   2. [FlexMicroform Card Payments](#flexmicroform-card-payments)
      1. [UI integration details](#ui-integration-details)
      2. [Backend (SSE) integration details](#backend-sse-integration-details)
   3. [Payer Authentication](#payer-authentication)
      1. [UI integration details](#ui-integration-details-1)
      2. [Backend (SSE) integration details](#backend-sse-integration-details-1)
   4. [Capturing funds during authorization (SALE)](#capturing-funds-during-authorization-sale)

## Description

Credit card payment services allow to process payment cards from different brands through a single secure connection.

The Credit Card payment service provides the following operations:

- Authorization
- Authorization Reversal (VOID)
- Sale (Authorization + Settlement)
- Refund

The following applies to credit card payments:

- Credit card payments using [FlexMicroform v0.11](https://developer.cybersource.com/api/developer-guides/dita-flex/SAFlexibleToken/FlexMicroform.html). The transient token represents both card number (PAN) and CVV. Only token, card expiration date and masked card number going to be sent in a webhook request.
- Payer Authentication (3D Secure)
- Shopper can choose to save credit card as part of profile
- Shopper can pay with a saved card

![Note](../images/note.jpg)  With Flex Microform, the capture of card number and security code (CVV) are fully outsourced to the payment provider, which can qualify merchants for SAQ A-based assessments. Flex Microform provides the most secure method for tokenizing card data. Sensitive data is encrypted on the customer's device before HTTPS transmission to the payment provider. This method mitigates any compromise of the HTTPS connection through a man in the middle attack.

## Implementation Details

### Configuration

The following gateway settings apply to credit card payments

| **Setting**                         | **Description**                                                                                   |
|-------------------------------------|---------------------------------------------------------------------------------------------------|
| **paymentMethodTypes**              | Enabled Payment Methods. 'Credit & Debit Card' should be enabled                                  |
| **paymentOptions**                  | Payment options enabled for payment using Payment Widget. 'Credit & Debit Card' should be enabled |
| **payerAuthEnabled**                | Enables payer authentication (3D Secure) for credit cards                                         |
| **payerAuthKeyId**                  | Cardinal Cruise Key ID. Request value from PSP                                                    |
| **payerAuthKey**                    | Cardinal Cruise Key. Request value from PSP                                                       |
| **secretKey3DS**                    | Required by OCC. Can be ignored                                                                   |
| **payerAuthOrgUnitId**              | Cardinal Cruise Org ID. Request value from PSP                                                    |
| **songbirdUrl**                     | Cardinal Commerce browser SDK to control payer authentication process in UI                       |
| **saleEnabled**                     | Indicates if authorizing and taking payment will be done at the same time                         |
| **flexSdkUrl**                      | Credit Card Flex SDK URL                                                                          |
| **isCVVRequiredForSavedCards**      | Should be disabled as CVV is not required in backend                                              |
| **isCVVRequiredForScheduledOrders** | Should be disabled as CVV is not required in backend                                              |

Default values:

- `payerAuthEnabled`: true. Payer authentication is enabled by default
- `flexSdkUrl`: https://flex.cybersource.com/cybersource/assets/microform/0.11/flex-microform.min.js
- `songbirdUrl`: https://songbirdstag.cardinalcommerce.com/edge/v1/songbird.js
- `secretKey3DS`: random value. [Required by OCC](https://docs.oracle.com/en/cloud/saas/cx-commerce/20c/ccdev/incorporate-3d-secure-support.html) but not required by implementation and not used anywhere
- `isCVVRequiredForSavedCards`: false
- `isCVVRequiredForScheduledOrders`: false
- `saleEnabled` - by default SALE is disabled for Card payments. Can be enabled in OCC Admin

### FlexMicroform Card Payments

The following describes the end to end use case with an option to save credit card:

1. Shopper chooses to checkout
2. Shopper enters credit card information
3. Credit card information is sent to payment provider client side and a one time (transient) use token is returned.
4. Save the one time client token and include the client token in the payment part of the order
5. Shopper chooses to save the credit card for later
6. Shopper places the order
7. Payment webhook is triggered with transaction type "0100" (authorize). The following properties sent in the request:
    - Transient token
    - Masked card number
    - Expiration date (This property must be sent because it must be saved)
    - Optional flag to save the card
8. Payment Provider response with an Approve decision and returns a multi-use token
9. OCC accepts the multi-use token and saves the card and associated properties (expiration date, masked card number if sent in request)
10. Shopper sees order confirmation and card is saved
11. Saved card should become visible in shopper's profile

![Flex Microform](images/flex-microform.png)

#### UI integration details

Below are credit card related components from Payment Widget:

```text
.
????????? widget
    ????????? isv-occ-payment
        ????????? js
        ???   ????????? components
        ???       ????????? Card
        ???       ???   ????????? CreditCardForm // Renders credit card form using FlexMicroform
        ???       ???   ????????? SavedCardSelector // Renders list of saved credit cards
        ???       ???   ????????? cardPaymentController.ts
        ???       ???   ????????? common.ts
        ???       ???   ????????? index.html
        ???       ???   ????????? index.ts
        ???       ???   ????????? paymentAuthentication // Handling Payer Authentication using CardinalCruise integration
        ???       ????????? PaymentSelector
        ???       ????????? index.ts // Before components appear on the page retrieve supported payment methods and retrieved saved cards for logged-in users
        ????????? widget.json
```

- Before Payment Widget is rendered available payment methods are retrieved from SSE `/ccstorex/custom/isv-payment/v1/paymentMethods` endpoint. Saved credit cards are also retrieved from OCC in case user is logged-in.
- `Card` component renders by default list of saved cards if it is not empty and user is logged-in. Otherwise credit card form is rendered
- Credit card form is managed by `CreditCardForm` component. Saved cards are managed by `SavedCardSelector` component. Shopper can switch between both components to choose preferable way to pay.
- FlexMicroform is initialized by fetching keys from SSE using `/ccstorex/custom/isv-payment/v1/keys` endpoint
- Credit card form is validated using rules defined in `payment-widget/widget/isv-occ-payment/js/components/Card/CreditCardForm/validator.ts`
- Transient token is generated client side and is then included into payment details during order submission
- In case shopper pays with saved card only savedCardId is sent and transient token is not generated. Shopper can also choose to set card as default

#### Backend (SSE) integration details

List of related controllers:

- `server-extension/src/controllers/paymentMethods.ts` - return supported payment method configurations
- `server-extension/src/controllers/flex.ts` - generate Flex keys

The list of handlers processing credit card Webhook requests in SSE can be found in `server-extension/src/services/payments/index.ts`

| **Operation**    | **Handlers**                    | **Description**                                                                                                  |
|------------------|---------------------------------|------------------------------------------------------------------------------------------------------------------|
| **card_0100**    | `validateTransientToken`        | validate transient token is valid by checking its signature                                                      |
|                  | `validateAuthJwt`               | validate payer authentication. applies when Payer Authentication is enabled                                      |
|                  | `cardAuthorizationRequest`      | convert Webhook request into payment PSP request                                                                 |
|                  | `processPayment`                | send payment request to PSP using client SDK                                                                     |
|                  | `authorizationResponse`         | converts PSP response into Webhook response                                                                      |
|                  |                                 |                                                                                                                  |
| **card_0110**    | `referenceInfoFallback`         | in case authorization transaction id is not sent by OCC fallback to the one found in order data fetched from OCC |
|                  | `authorizationReversalRequest`  | converts Webhook request into reversal PSP request                                                               |
|                  | `processAuthorizationReversal`  | sends reversal request to PSP using client SDK                                                                   |
|                  | `authorizationReversalResponse` | converts PSP response into Webhook response                                                                      |
|                  |                                 |                                                                                                                  |
| **generic_0400** | `referenceInfoFallback`         | in case authorization transaction id is not sent by OCC fallback to the one found in order data fetched from OCC |
|                  | `refundRequest`                 | converts Webhook request into refund PSP request                                                                 |
|                  | `processRefund`                 | sends refund request to PSP using client SDK                                                                     |
|                  | `refundResponse`                | converts PSP response into Webhook response                                                                      |

### Payer Authentication

Consume authentication is supported through the means of [Cardinal Cruise](https://cardinaldocs.atlassian.net/wiki/spaces/CC/overview?mode=global) integration. According to documentation:
> If you are using tokenization, you must use the Hybrid integration method.

Considering FlexMicroform is based on credit card tokenization and same is applicable to saved credit cards the Hybrid integration method has being considered for implementation. Please refer to the following documentation on how Hybrid integration method works:

- [Cardinal Cruise Hybrid](https://cardinaldocs.atlassian.net/wiki/spaces/CC/pages/360668/Cardinal+Cruise+Hybrid)
- [Cybersource Payer Authentication using Simple Order API](https://developer.cybersource.com/library/documentation/dev_guides/Payer_Authentication_SO_API/Payer_Authentication_SO_API.pdf)
- [Hybrid Payer Authentication](https://developer.cybersource.com/library/documentation/dev_guides/Payer_Authentication_SO_API/html/Topics/Hybrid_Payer_Authentication.htm)

Although documents refer to Simple Order API (SOAP) same concepts apply to [REST API](https://developer.cybersource.com/api-reference-assets/index.html#payer-authentication)

Payer authentication services can be requested together with authorization service. It saves up additional calls to backend unless enrollment and validation services are called separately. The credit card flow described above is extended with additional custom data (using custom properties) to include payer authentication related information.

Payer authentication is enabled by default using `payerAuthEnabled` gateway setting. It can be disabled in OCC Admin.

![Important](../images/important.jpg) You should contact payment provider in order to enable Payer Authentication services for your merchant account and get values for the following gateway settings: `payerAuthKeyId`, `payerAuthKey`, `payerAuthOrgUnitId`

Generally payer authentication services are executed together with credit card authorization:

1. JWT token is created using existing order information using `/ccstorex/custom/isv-payment/v1/payerAuth/generateJwt` SSE endpoint
2. Cardinal Cruise JS SDK library is included into storefront and is called to setup the payer auth process
3. Credit card is tokenized as per process described in the [FlexMicroform Card Payments](#flexmicroform-card-payments) section
4. Order is created and "Authorize" Webhook request is triggered
5. Credit card Authorization service is called along with Payer Auth Enrollment
6. In case credit card is enrolled in payer authentication authorization is rejected with specific reason code (10000). The reply from payment provider will contain all data needed to start consumer authentication flow in storefront
7. Payer Auth data is included into Webhook response using custom payment properties
8. In storefront Cardinal Cruise JS SDK continues the consumer authentication flow with the custom payment properties returned in Webhook response.
9. Popup window is displayed to finish consumer authentication
10. On successful authentication `authJwt` is returned and is included in custom payment request properties
11. Card authorization is triggered again by calling order creation OCC operation
12. "Authorize" Webhook request is triggered with `authJwt` being included in its payload
13. Card authorization service is executed along with Payer Auth Validation service

The diagram below denotes all the steps involved (happy path scenario):

![Payer Authentication](images/payer-auth.png)

#### UI integration details

The following UI component contains Payer Authentication integration logic `payment-widget/widget/isv-occ-payment/js/components/Card/paymentAuthentication/index.ts`

- Payer Authentication is initiated by generating a signed JWT token containing current order data. The following SSE endpoint is used `/ccstorex/custom/isv-payment/v1/payerAuth/generateJwt`
- Payment details are being enhanced with validation JWT token once shopper finishes consumer authentication process

#### Backend (SSE) integration details

- `server-extension/src/controllers/payerAuth.ts` Controller for generating a signed PayerAuth JWT
- `server-extension/src/services/payments/validators/authJwtValidator.ts` Component to validate authentication JWT (authJwt)
- `server-extension/src/services/payments/converters/request/mappers/payerAuthEnrollMapper.ts` Including payer auth reference id into PSP card authorization request
- `server-extension/src/services/payments/converters/request/mappers/payerAuthValidationMapper.ts` Including payer auth validation token into PSP card authorization request

### Capturing funds during authorization (SALE)

In case merchants would like funds to be captured (settled) during card authorizations `saleEnabled` gateway setting can be updated to enable it for credit cards.

In case 'SALE' is enabled for credit cards '4000' response code is sent back in Webhook response so that OCC becomes aware of that.

![Important](../images/important.jpg) merchants must ensure that they issue refunds if the order or some part of it cannot be fulfilled or the order is canceled.
