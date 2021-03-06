# Package Contents <!-- omit in toc -->

1. [Overall project structure](#overall-project-structure)
2. [OCC CLI Utilities](#occ-cli-utilities)
3. [Payment Gateway Package (payment-gateway)](#payment-gateway-package-payment-gateway)
4. [Server Extension Package (server-extension)](#server-extension-package-server-extension)
   1. [Authorizing access to endpoints](#authorizing-access-to-endpoints)
   2. [Request processing components](#request-processing-components)
   3. [Payment Dispatcher](#payment-dispatcher)
   4. [Build process](#build-process)
5. [Payment Widget Package (payment-widget)](#payment-widget-package-payment-widget)
6. [Saved Cards Widget Package (saved-cards-widget)](#saved-cards-widget-package-saved-cards-widget)

## Overall project structure

```text
.
├── README.md
├── bin
│   ├── index.js
│   ├── sse // CLI commands to manage SSE deployment
│   └── widget // CLI commands to manage widget deployment
├── certs // Certificates for local development, needed for testing communication over HTTPS
│   ├── localhost.crt
│   └── localhost.key
├── documentation
├── husky.config.js // GIT hooks to check code before it is being pushed
├── jest.config.js // Common testing framework setup
├── lerna.json
├── lib // CLI commands implementation
│   ├── common
│   ├── sse
│   └── widget
├── lint-staged.config.js
├── package.json // Common NodeJS dependencies and 'yarn' scripts to help build
├── packages
│   ├── occ-mock-server // Mocking OCC APIs for local development
│   ├── occ-mock-storefront // Mocking OCC Storefront libraries and modules for local development
│   ├── occ-sdk // OCC REST SDK - Typescript friendly wrapper
│   ├── payment-gateway // Payment Gateway Settings
│   ├── payment-sdk // PSP REST SDK
│   ├── payment-widget // Payment Widget - payment components and UI checkout integration logic
│   ├── saved-cards-widget // Saved Cards Widget for user's profile for My Account
│   └── server-extension // Payment integration service
├── tsconfig.json // Common Typescript compiler configuration
└── yarn.lock
```

Solution is composed of particular packages primarily utilizing Typescript as programming language.

Build process and modularization has been implemented by using [Yarn workspaces](https://classic.yarnpkg.com/en/docs/workspaces/) and [Lerna](https://lerna.js.org/)

All available Yarn scripts to help you start with building and deploying solution in OCC can be found in the `scripts` section of the `package.json` file.

By running `yarn install` all NodeJS dependencies are going to be installed and you should be able to proceed with further development or deployment tasks

![Note](images/note.jpg) Please refer to the Installation section of the document to find out more about building and deploying payment solution to OCC

Component dependencies are depicted in the diagram below:

![Component dependencies](images/component-dependencies.png)

Please notice all the packages on the left are those which should be deployed to OCC in order to get the payment plugin work. Packages on the right hand side have been created with better separation of concerns and modularity in mind.

## OCC CLI Utilities

In order to help with managing deployments to OCC of both widgets and SSE payment plugin includes CLI commands to help with automating the process.

The CLI tool is a combined version of utilities shared in the following community resources:

- [Node.js Server-Side Extension CLI](https://community.oracle.com/docs/DOC-1038506)
- [Node.js CLI for Managing Storefront Extensions](https://community.oracle.com/groups/oracle-commerce-cloud-group/blog/2020/05/04/nodejs-cli-for-managing-storefront-extensions)

By running `yarn occ` you will get the list of supported commands

```bash
yarn run v1.22.4
$ node ./bin/index.js
Usage: index [options] [command]

Options:
  -h, --help                                            display help for command

Commands:
  create-extension-id [options] <extensionName>         Create CX Commerce Storefront extension id
  upload-extension [options] <extensionName>            Import CX Commerce Storefront extension to host
  package-extension [options] <extensionName>           Create extension archive
  deactivate-extension [options] <extensionName>        Deactivate CX Commerce Storefront extension
  activate-extension [options] <extensionName>          Activate CX Commerce Storefront extension
  remove-extension [options] <extensionName>            Remove CX Commerce Storefront extension
  find-extension-id [options] <extensionName>           Remove CX Commerce Storefront extension
  list-apps [options]                                   List server-side extension custom apps on CX Commerce server
  package-app <appName>                                 Create server-side extension archive
  upload-app [options] <appName>                        Upload server-side extension custom app to CX Commerce server
  server-log [options]                                  Get server-side extension logs
  tail-log [options]                                    Tail server-side extension logs
  download-app [options] <appName>                      Download server-side custom app files
  list-routes [options] [appName]                       List custom app routes
  config:list [options]                                 List environment variables
  config:set [options] <envVar> [otherEnvVars...]       Set environment variables
  config:unset [options] <envVar> [otherEnvVars...]     Set environment variables
  run-tests [options] <appName>                         Run tests
  upload-apple-domain-association [options] <filePath>  Upload Apple Pay domain association file
  settings:list [options] <gatewayId>                   Get Custom Site Settings. Get site settings by ID.
  settings:set [options] <gatewayId> <payload>          Update a Site Settings based on ID and request parameters.
  help [command]                                        display help for command
```

Please familiarize yourself with available command options by looking at `bin/sse/commands.js` and `bin/widget/commands.js` scripts

## Payment Gateway Package (payment-gateway)

The `payment-gateway` package hold gateway settings definition according to [Supported payment methods and transaction types](https://docs.oracle.com/en/cloud/saas/cx-commerce/20c/ccdev/supported-payment-methods-and-transaction-types.html). It has the following contents:

```text
.
├── ext.json
├── gateway
│   └── isv-occ-gateway // name of the  gateway
│       ├── config
│       │   ├── config.json // configuration properties
│       │   └── locales
│       └── gateway.json // supported payment methods and transaction types
├── package.json
└── settings.json // sample gateway settings used in local development and integration testing
```

The `gateway/isv-occ-gateway/gateway.json` file has the following definition:

```json
{
  "provider": "ISV OCC Gateway",
  "paymentMethodTypes": ["generic", "card"],
  "transactionTypes": {
    "generic": ["initiate", "retrieve", "authorization", "void", "refund"],
    "card": ["authorization", "void", "refund"]
  },
  "processors" : {
    "card": "card3ds"
  }
}
```

Configuration above enables support for card payments as well as generic payments.

![Note](images/note.jpg) `settings.json` should be configured with particular values in order to be able to proceed with local development and testing.

![Important](images/important.jpg) Adding `processors.card` section makes sure [Generic Webhook](https://docs.oracle.com/en/cloud/saas/commerce-cloud/20a/cxocc/op-ccadmin-v1-webhook-genericpayment-post.html) will be triggered for both `card` and `generic` payment methods

The following settings can be configured in gateway:

| **Setting**                         | **Description**                                                                                                                                                                                                                                                                                                   |
|-------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Common**                          |                                                                                                                                                                                                                                                                                                                   |
| **paymentMethodTypes**              | Enabled Payment Methods. Most of the time should both options                                                                                                                                                                                                                                                     |
| **paymentOptions**                  | Payment options enabled for payment using Payment Widget                                                                                                                                                                                                                                                          |
| **merchantID**                      | Merchant ID                                                                                                                                                                                                                                                                                                       |
| **merchantKeyId**                   | Merchant Key ID                                                                                                                                                                                                                                                                                                   |
| **merchantsecretKey**               | Merchant Secret Key                                                                                                                                                                                                                                                                                               |
| **authenticationType**              | Authentication Type                                                                                                                                                                                                                                                                                               |
| **keyAlias**                        | Key Alias (in case authentication type = jwt)                                                                                                                                                                                                                                                                     |
| **keyPass**                         | Key Pass (in case authentication type = jwt)                                                                                                                                                                                                                                                                      |
| **keyFileName**                     | Key File Name (in case authentication type = jwt)                                                                                                                                                                                                                                                                 |
| **runEnvironment**                  | PSP REST API environment to send requests to                                                                                                                                                                                                                                                                      |
| **saleEnabled**                     | Indicates if authorizing and taking payment will be done at the same time for a particular payment mode                                                                                                                                                                                                           |
|                                     |                                                                                                                                                                                                                                                                                                                   |
| **Credit Card**                     |                                                                                                                                                                                                                                                                                                                   |
| **payerAuthEnabled**                | Enables payer authentication for credit cards                                                                                                                                                                                                                                                                     |
| **payerAuthKeyId**                  | Cardinal Cruise Key ID. Request from PSP                                                                                                                                                                                                                                                                          |
| **payerAuthKey**                    | Cardinal Cruise Key. Request from PSP                                                                                                                                                                                                                                                                             |
| **secretKey3DS**                    | Required by OCC. Can be ignored                                                                                                                                                                                                                                                                                   |
| **payerAuthOrgUnitId**              | Cardinal Cruise Org ID. Request from PSP                                                                                                                                                                                                                                                                          |
| **songbirdUrl**                     | Cardinal Commerce browser SDK to control payer authentication process in UI                                                                                                                                                                                                                                       |
| **flexSdkUrl**                      | Credit Card Flex SDK URL                                                                                                                                                                                                                                                                                          |
| **isCVVRequiredForSavedCards**      | Is the CVV required when using a saved card.                                                                                                                                                                                                                                                                      |
| **isCVVRequiredForScheduledOrders** | Is the CVV required for a Scheduled Order                                                                                                                                                                                                                                                                         |
|                                     |                                                                                                                                                                                                                                                                                                                   |
| **GooglePay**                       |                                                                                                                                                                                                                                                                                                                   |
| **googlePaySdkUrl**                 | GooglePay SDK URL                                                                                                                                                                                                                                                                                                 |
| **googlePayEnvironment**            | GooglePay environment                                                                                                                                                                                                                                                                                             |
| **googlePayGateway**                | To retrieve payment and customer information from a payment gateway that's supported by the Google Pay API. Gateway's identifier, which is issued by Google                                                                                                                                                       |
| **googlePayGatewayMerchantId**      | To retrieve payment and customer information from a payment gateway that's supported by the Google Pay API. Your gateway account ID, which is provided by the gateway                                                                                                                                             |
| **googlePayMerchantId**             | A Google merchant identifier issued after registration with the Google Pay Business Console. Required when PaymentsClient is initialized with an environment property of PRODUCTION. See Request production access for more information about the approval process and how to obtain a Google merchant identifier |
| **googlePayMerchantName**           | Merchant name encoded as UTF-8. Merchant name is rendered in the payment sheet. In TEST environment, or if a merchant isn't recognized, a “Pay Unverified Merchant” message is displayed in the payment sheet                                                                                                     |
| **googlePaySupportedNetworks**      | GooglePay Supported networks                                                                                                                                                                                                                                                                                      |
|                                     |                                                                                                                                                                                                                                                                                                                   |
| **ApplePay**                        |                                                                                                                                                                                                                                                                                                                   |
| **applePayMerchantId**              | ApplePay Merchant ID                                                                                                                                                                                                                                                                                              |
| **applePayInitiative**              | A predefined value that identifies the e-commerce application making the request. For ApplePay on the web use 'web'                                                                                                                                                                                               |
| **applePayInitiativeContext**       | Fully qualified domain name associated with your Apple Pay Merchant Identity Certificate                                                                                                                                                                                                                          |
| **applePaySupportedNetworks**       | ApplePay Supported Networks                                                                                                                                                                                                                                                                                       |
|                                     |                                                                                                                                                                                                                                                                                                                   |
| **Decision Manager**                |                                                                                                                                                                                                                                                                                                                   |
| **dmDecisionSkip**                  | Indicates which payment modes should skip the decision manager step                                                                                                                                                                                                                                               |
| **deviceFingerprintEnabled**        | Enable Device Fingerprint                                                                                                                                                                                                                                                                                         |
| **deviceFingerprintUrl**            | Device Fingerprint URL                                                                                                                                                                                                                                                                                            |
| **deviceFingerprintOrgId**          | Device Fingerprint Organization ID                                                                                                                                                                                                                                                                                |
|                                     |                                                                                                                                                                                                                                                                                                                   |
| **Reporting**                       |                                                                                                                                                                                                                                                                                                                   |
| **dailyReportName**                 | Daily Report Name                                                                                                                                                                                                                                                                                                 |

![Important](images/important.jpg) `secretKey3DS`, `isCVVRequiredForSavedCards` and `isCVVRequiredForScheduledOrders` should be present in gateway settings in order for saved cards and Payer Authentication to be working

Please refer to the [Authentication](https://developer.cybersource.com/api/developer-guides/dita-gettingstarted/authentication.html) documentation to learn more about available authentication types. In case authentication type is JWT you should place `p12` key file in `packages/server-extension/certs` directory, the `keyFileName` setting should be equal to the file name without 'p12' extension. `keyAlias` and `keyPass` should be updated accordingly (usually same value as MID).

## Server Extension Package (server-extension)

According to the list of supported features the [Generic Payment Gateway Integration](https://docs.oracle.com/en/cloud/saas/commerce-cloud/occ-developer/create-generic-payment-gateway-integration1.html) becomes the most suitable implementation method.

SSE provides an option to develop custom logic without need to deploy the service in an external environment or infrastructure. SSE facilitates communications between OCC and the payment service provider. The payment integration service performs the following functions:

- Integrates with the payment service provider using [client SDK](https://github.com/CyberSource/cybersource-rest-client-node)
- Authentication to the payment service provider
- Translation of OCC payment webhook requests to the format required by the payment provider.
- Translation of the payment provider response into the format required by OCC payment webhook.
- Integration of payment fraud detection services (Decision Manager)
- Additional APIs exposed for OMS systems
- Integration of custom business logic

The payment gateway integration service introduces dependency to PSP REST SDK client which facilitates all operations with the underlying PSP REST API. It handles authentication concerns and merchant configuration for the API client. Below is the list external resources which document the REST API being consumed

- [API Reference](https://developer.cybersource.com/api-reference-assets/index.html#payments)
- [Supported authentication mechanisms](https://developer.cybersource.com/api/developer-guides/dita-payments/authentication.html)

Find below the structure of the package:

```text
.
├── certs
├── config
│   ├── app.local.json // Configuration properties for local development
│   └── app.prod.json // Configuration properties for OCC environment (applied for a deployed SSE)
├── docs
│   └── isv-occ-payment.postman_collection.json // Postman collection with all SSE endpoints available for testing
├── jest.config.js
├── jest.int.config.js // Unit tests setup
├── jest.unit.config.js // Integration tests setup
├── locales
├── node_modules // Modules to be deployed to OCC along with custom SSE code
├── nodemon.json
├── package-lock.json
├── package.json
├── src
│   ├── __tests__
│   ├── app.ts // Main entry point for SSE in OCC env, being loaded on start-up
│   ├── common
│   ├── controllers // API endpoints
│   ├── errors
│   ├── index.ts
│   ├── middlewares
│   │   ├── contextLoader.ts // Initialize service logic
│   │   ├── errorHandler.ts // Error handling logic
│   │   ├── gatewaySettings.ts // Fetch gateway settings for a given channel (e.g. agent, preview)
│   │   ├── logger.ts // Simple logger which can be disabled if not needed
│   │   ├── merchantConfig.ts // Create PSP SK configuration out of gateway settings
│   │   └── validateWebhook.ts // Validate Webhook signature
│   ├── server.ts // Local development server
│   ├── services // All payment integration logic resides here
│   └── types
│       └── occ-sdk.d.ts
└── tsconfig.json
```

![Note](images/note.jpg) Please notice a Postman collection (`docs/isv-occ-payment.postman_collection.json`) is included into SSE package which can be used for testing and exploring the following API endpoints:

| **Endpoint**                                            | **Description**                                                                                                                 |
|---------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------|
| `/ccstorex/custom/isv-payment/v1/paymentMethods`        | Returns list of supported payment types. Consumer: Payment Widget                                                               |
| `/ccstorex/custom/isv-payment/v1/keys`                  | Generates Flex public key (capture context). Consumer: Payment Widget                                                           |
| `/ccstorex/custom/isv-payment/v1/payments`              | Generic Payments Webhook handler endpoint. Consumer: OCC                                                                        |
| `/ccstorex/custom/isv-payment/v1/payerAuth/generateJwt` | Generates JWT for payer authentication. Consumer: Payment Widget                                                                |
| `/ccstorex/custom/isv-payment/v1/applepay/validate`     | Validates ApplePay session. Consumer: Payment Widget                                                                            |
| `/ccstorex/custom/isv-payment/v1/report/daily`          | Returns daily conversion report for a given date. Consumer: Fulfillment                                                         |
| `/ccstorex/custom/isv-payment/v1/report/onDemand`       | Returns conversion report for specified start and end dates. Applies only for less than 24 hour interval. Consumer: Fulfillment |
| `/ccstorex/custom/isv-payment/v1/capture`               | Capture funds for a given transaction. Consumer: Fulfillment                                                                    |
| `/ccstorex/custom/isv-payment/v1/refund`                | Refund payment for a given transaction. Consumer: Fulfillment                                                                   |

### Authorizing access to endpoints

Those endpoints which will be consumed by Fulfillment might need be secured so that only authorized calls come through. OCCS provides a custom 'authenticatedUrls' property which describes the routes that a user must be logged in to access

In order to add url to 'authenticatedUrls' property in package.json use the following syntax:

```json
  "authenticatedUrls": [
    {
      "url": "/ccstorex/custom/isv-payment/v1/capture",
      "method": [
        "post"
      ]
    },
    {
      "url": "/ccstorex/custom/isv-payment/v1/refund",
      "method": [
        "post"
      ]
    },
    {
      "url": "/ccstorex/custom/isv-payment/v1/report/daily",
      "method": [
        "get"
      ]
    },
    {
      "url": "/ccstorex/custom/isv-payment/v1/report/onDemand",
      "method": [
        "get"
      ]
    }
  ],
```

### Request processing components

Each request reaching out SSE endpoints goes through a set of processing components. Please follow the request processing path in the diagram below:

![Processing Flow](images/sse-processing-components.png)

- Each request first goes through a list of common ExpressJS middleware
- Controllers represent API entry points
- Service Logic handles all business logic
- Communication with PSP is handled by SDK client library

The table below lists available middleware components

| **Middleware**     | **Description**                                                             |
|--------------------|-----------------------------------------------------------------------------|
| `contextLoader`    | Initializes service layer logic                                             |
| `loggerMiddleware` | Can be used to log incoming HTTP request details                            |
| `validateWebhook`  | Validates Webhook signature                                                 |
| `gatewaySettings`  | Request gateway settings from OCC and cache it for a configurable TTL value |
| `merchantConfig`   | Creates merchant configuration for SDK client                               |
| `allRoutes`        | Registers all endpoints (routes)                                            |
| `errorMiddleware`  | Centralized error handling                                                  |

Additional configuration properties managed by 'nconf' library available in OCC environment are located at `packages/server-extension/config`. Please notice there are version for local and production (deployed) environments

SSE communicates with PSP using client [NodeJS SDK v0.0.20](https://github.com/CyberSource/cybersource-rest-client-node). Typescript friendly SDK wrapper is located in the `packages/payment-sdk`. It declares TS type definition's for the PSP API. You can manage generated type definitions by tweaking `packages/payment-sdk/generator/cybersource-ts-template/api.mustache` template. In order to generate new types from the updated template run the following:

```bash
cd packages/payment-sdk
yarn generate
```

![Important](images/important.jpg) You will need to re-generate new type definitions for the PSP SDK once you upgrade to the new client SDK version. please follow new release updates in the [Official repository](https://github.com/CyberSource/cybersource-rest-client-node/releases)

OCC endpoints are consumed using OCC provided SDK library. TS wrapper for the SDK is available in a separate package `packages/occ-sdk`.

### Payment Dispatcher

The entry point for Webhook payments logic is defined in `packages/server-extension/src/services/payments/index.ts`. Webhook request is dispatched to a specific chain of request handlers based on transaction type and payment method type. Please see below conceptual diagram which depicts how Webhook request is being dispatched to a particular chain of responsibility:

![Payment Dispatcher](images/dispatcher.png)

### Build process

Once `server-extension` is built using `yarn build:prod` command it is ready for deployment to OCC.

Code is being compiled by Typescript into NodeJS (CJS) module format and output is located at `packages/server-extension/cjs`.

## Payment Widget Package (payment-widget)

Payment provides UI implementation of the payment selector component for an user to be able to choose payment method from the list of supported methods.

The widget will integrate with OCC through the means of Generic Webhook with custom logic and flows being supported by custom payment properties delivered as part of the webhook payload.

Payment widget will render previously saved cards as an option to commit a payment.

Please refer to the documents below to familiarize yourself with Widget development:

- [Understand Widgets](https://docs.oracle.com/en/cloud/saas/cx-commerce/20c/widge/understand-widgets.html)
- [Developing a Custom Widget in Oracle Commerce Cloud](https://community.oracle.com/groups/oracle-commerce-cloud-group/blog/2019/04/24/developing-a-custom-widget-in-oracle-commerce-cloud)

The overall UI integration flow is as follows:

1. Payment Widget is initialized with available Storefront view models in the `onLoad` method in `payment-widget/widget/isv-occ-payment/js/isv-occ-payment.ts`
2. Before Widget appears a list of supported payment methods is fetched from the SSE (`/ccstorex/custom/isv-payment/v1/paymentMethods`)
3. Payment selector UI component renders the list of supported payment methods
4. User can chooses one of the methods and proceed with order placement by providing payment details
5. Order is submitted to OCC and Generic Webhook is called
6. SSE performs submitted operation based on transaction type and payment method
7. Webhook response is compiled with additional payment properties supplied in the response payload
8. Widget gets reply from Webhook and performs further actions based on the payload (e.g. display Payer Authentication screen)

Find below the structure of the package

```text
.
├── ext.json
├── jest.config.js
├── node_modules
├── package.json
├── tsconfig.json
├── webpack.common.js
├── webpack.dev.config.js // Webpack configuration for local development
├── webpack.prod.config.js // Webpack configuration for bundling JS for OCC environment
└── widget
    └── isv-occ-payment
        ├── js
        │   ├── __tests__
        │   ├── common
        │   ├── components // All payment components
        │   ├── constants
        │   ├── dev // Local development support
        │   ├── isv-occ-payment.bundle.js // This is the actual JS widget module that is compiled from all Typescript assets and is used by OCC
        │   ├── isv-occ-payment.ts
        │   ├── services
        │   │   ├── checkout.ts // Integration point to handle OCC events and payment orchestration
        │   │   └── occClient.ts // API client for endpoints exposed by SEE and OCC
        │   ├── store // State and payment actions shared between all payment components
        │   └── types
        ├── less
        │   └── widget.less
        ├── locales
        │   └── en
        │       └── ns.isv-occ-payment.json
        ├── templates
        │   └── display.template
        └── widget.json
```

![Important](images/important.jpg) `widget/isv-occ-payment/js/services/checkout.ts` extends OOTB methods `createOrder` and `postOrderCreateOrUpdateSuccess` from `OrderViewModel` in order to wait for payment details to be resolved in asynchronous way. OOTB OCC does not support asynchronous payment details (e.g. does not wait until those are available before submitting an order). One could choose to customize OrderViewModel to incorporate same logic as in `checkout.ts`.

After customizing codebase you will need to compile a new JS module for the widget by running `yarn build:prod`. It will result in a new JS module `widget/js/isv-occ-payment/isv-occ-payment.bundle.js`

The overall payment components interaction flow withing checkout process is presented below:

![Payment Widget Architecture](images/payment-widget-arch.png)

1. Shopper clicks 'Place  Order' button
2. 'initiate' payment action is triggered with current selected payment method
3. Payment action is routed to the appropriate component which listens to the initiate action
4. Payment component collects payment details (might be in asynchronous way)
5. Checkout process waits until payment details are available and then updates OrderViewModel's payments array accordingly. Order is submitted
6. Payment is finalized on successful submission

The flow documented above applies to all payment components

## Saved Cards Widget Package (saved-cards-widget)

Saved Cards widget enables customers to view and manage saved cards stores as part of user's profile.

The following documents provide enough details in order to understand implementation details:

- [Support stored credit cards](https://docs.oracle.com/en/cloud/saas/cx-commerce/20c/ccdev/support-stored-credit-cards.html)
- [Technical Dive Implementing Stored Cards Examples](https://community.oracle.com/docs/DOC-1030476)

Saved Cards widget can be installed into My Account layouts and implements the following:

- Fetching list of saved cards and rendering those by marking default card
- Set card as default
- Edit card nickname
- Remove saved card

```text
.
├── ext.json
├── jest.config.js
├── package.json
├── tsconfig.json
├── webpack.common.js
├── webpack.dev.config.js // Webpack configuration for local development
├── webpack.prod.config.js // Webpack configuration for bundling JS for OCC environment
└── widget
    └── saved-cards
        ├── js
        │   ├── __tests__
        │   ├── components
        │   │   └── SavedCard
        │   ├── dev
        │   ├── saved-cards.bundle.js // This is the actual JS widget module that is compiled from all Typescript assets and is used by OCC
        │   ├── saved-cards.ts
        │   ├── services
        │   │   └── profileCardsClient.ts // REST client for saved card operations
        │   ├── store
        │   │   ├── actions.ts
        │   │   └── index.ts
        │   └── types
        │       └── index.d.ts
        ├── less
        │   └── widget.less
        ├── locales
        │   └── en
        │       └── ns.saved-cards.json
        ├── templates
        │   └── display.template // Renders 'SavedCard' components
        └── widget.json
```

![Important](images/important.jpg) After customizing codebase you will need to compile a new JS module for the widget by running `yarn build:prod`. It will result in a new JS module `widget/js/saved-cards/saved-cards.bundle.js`
