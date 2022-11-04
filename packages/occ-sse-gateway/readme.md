# Oracle Commerce Payment Gateway Service
Package includes Commerce payment gateway service implementation best practices and examples.

## Introduction
There are a number of payment gateway design goals this project serves to illustrate. They are:
- Provide 3rd party developers Javascript classes for payment services and transaction processing that they can extend in their own packages
- Provide middleware processing model that 3rd party developers can follow to customize their transaction processing
- Provide request validation handling for basic authentication and HMAC signature verification

## Installation
- Copy all package files to desired location.
- Run `yarn install` to install all dependencies.

## Request Routing

The application supports dynamic routing based on the `paymentType` path parameter.

Payment type can be `generic` or `card`.

The path parameters enable the developer to support both [cardPayment](https://docs.oracle.com/en/cloud/saas/cx-commerce/21b/cxocc/op-ccadmin-v1-webhook-genericcardpayment-post.html) and [genericPayment](https://docs.oracle.com/en/cloud/saas/cx-commerce/21b/cxocc/op-ccadmin-v1-webhook-genericpayment-post.html) webhook triggers. 

In order to support available request channels, developers should use the customer header: `X-CCRequest-Mode`
The request channel, or *mode*, values are `agent`, `preview`, or `store`. 


### Route Examples

As an example, the route `https://{{storefront.host}}/ccstorex/custom/v1/payments/generic` should be configured as a 
destination for the [genericPayment](https://docs.oracle.com/en/cloud/saas/cx-commerce/21b/cxocc/op-ccadmin-v1-webhook-genericpayment-post.html) webhook trigger.

Another example, the route `https://{{storefront.host}}/ccstorex/custom/v1/payments/card` should be configured as a 
destination for the [cardPayment](https://docs.oracle.com/en/cloud/saas/cx-commerce/21b/cxocc/op-ccadmin-v1-webhook-genericcardpayment-post.html) webhook trigger.

To support channel specifc environment varaibles keys, also include the custom header `X-CCRequest-Mode` with the  `agent`, `preview`, or `store` in order to indicate which channel or *mode* is being triggered


## Request Validation
There are two mechanisms that Commerce provides for validating the webhook request and its payload. They are:
- [Basic authentication](#basic-authentication)
- [HMAC signature verification](#hmac-signature-verification)

This application provides Express middleware functions that handle both of the above validations following Commerce best practices.
Both validation mechanisms require storing secret information which must be checked on each request. Commerce recommends all secrets 
are stored as environment variables.

The included middleware functions implement a pattern for managing the environment variable keys that allow developers to store uniqiue
secret values for all webhook trigger events in all provided Commerce environments. This pattern is based on the request path.

Request path is the request path without the host and base path values.
As an example, a request to the route `https://{{storefront.host}}/ccstorex/custom/v1/payments/generic` and including the header  `X-CCRequest-Mode: preview` should have an environment variable key containing `PREVIEW_V1_PAYMENTS_GENERIC`.

### Basic authentication

Environment variable key pattern: `{channel}_{path}_AUTH`
Environment variable value pattern: `{username}:{password}`

Here's an example webhook trigger with a destination route of `https://{{storefront.host}}/ccstorex/custom/v1/payments/generic` made in preview mode
including the header  `X-CCRequest-Mode: preview` with the basic authentication values of username `admin`, password `admin`.
 
To validate this request create the following environment variable:
`PREVIEW_V1_PAYMENTS_GENERIC_AUTH=admin:admin`

### HMAC signature verification

Environment variable key pattern: `{channel}_{path}_SECRET`
Environment variable value pattern: `{secret}`

Here's an example webhook trigger with a destination route of `https://{{storefront.host}}/ccstorex/custom/v1/payments/generic`  
including the header  `X-CCRequest-Mode: preview` with the HMAC signature value `TEST`.
 
To validate this request create the following environment variable: `PREVIEW_V1_PAYMENTS_GENERIC_SECRET=TEST`


### Scripts

The project `package.json` contains a number of scripts. They are:

- `yarn start` which runs the service locally. 
- `yarn test` which runs all unit tests. 
- `yarn write-docs` which writes all jsdocs.