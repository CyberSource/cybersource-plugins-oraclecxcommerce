
# Cybersource Official Payment Plugin

## Oracle Commerce Cloud

## Contents

| Documentation                                                  | Description                                                                                                                  |
|----------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------|
| [Introduction](introduction.md)                                | Read introduction to become familiar with overall architecture                                                               |
| [Package Contents](package-contents.md)                        | Detailed explanation of each package included into solution. Documents available payment gateway settings                    |
| [Installation](installation.md)                                | Go through installation steps to deploy and configure payment extensions to OCC                                              |
| _Payment Services_                                             |                                                                                                                              |
| [Credit Card](payment-services/credit-card.md)                 | Detailed information about card payment services, e.g.Microform integration, Payer Authentication (3DSecure) etc |
| [GooglePay](payment-services/googlepay.md)                     | Documents GooglePay integration and related technical details                                                                |
| [ApplePay](payment-services/applepay.md)                       | Documents ApplePay integration and related technical details. Includes ApplePay setup steps                                  |
| [Settlement and Refund](payment-services/settlement-refund.md) | Additional payment services to allow fulfillment processes to settle or refund particular transactions when needed           |
| _Business Services_                                            |                                                                                                                              |
| [Decision Manager](business-services/decision-manager.md)      | A detailed technical guide on fraud detection and manual review of transactions                                              |
| [Reporting](business-services/reporting.md)                    | Additional Reporting APIs to allow fulfillment retrieve transactions reviewed in Decision Manager                            |
| [Support](support.md)                                          | Support information                                                                                                          |


## Audience and Purpose

This document is written for merchants who want to use Payment and Value added Business services. This document provides an overview for integrating Cybersource Official payment services into Oracle Commerce Cloud platform.

## Conventions

### Note, Important, and Warning Statements

![Note](images/note.jpg)  A Note contains helpful suggestions or references to material not contained in the document.

![Important](images/important.jpg) An Important statement contains information essential to successfully completing a task or learning a concept.

![Warning](images/warning.jpg) A Warning contains information or instructions, which, if not heeded, can result in a security risk, irreversible loss of data, or significant cost in time or revenue or both.

### Text and Command Conventions

| **Convention**   | **Usage**                                                                             |
|------------------|---------------------------------------------------------------------------------------|
| `Inline Code`    | Field and service names in text; for example: Include the `card_accountNumber` field. |
|                  | Items that you are instructed to act upon; for example: `Click Save`.                 |
| ```Code Block``` | XML/JSON elements.                                                                    |
|                  | Code examples and samples.                                                            |

### Acronyms and terminology

| **Acronym**            | **Description**                                                                                                                                    |
|------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------|
| **SI**                 | System Integrator. A person or company that specializes in integrating the Oracle Commerce Cloud Payment extension                                 |
| **RI**                 | Reference Implementation. The implementation of payment integration for Oracle Commerce Cloud using the widget framework and server side extension |
| **OCC**                | Oracle Commerce Cloud                                                                                                                              |
| **Payment Widget**     | UI representation of payment methods plugable into storefront's checkout pages                                                                     |
| **SSE**                | Server side extension. Payment Integration Service                                                                                                 |
| **OOTB**               | Out Of The Box                                                                                                                                     |
| **Converter**          | A component which transforms payment service request into REST API specific object.                                                                |
| **MID**                | Merchant Account                                                                                                                                   |
| **DM**                 | Decision Manager                                                                                                                                   |
| **PSP**                | Payment Service Provider                                                                                                                           |
| **TS**                 | Typescript                                                                                                                                         |

## Related Documents

- Supplemental Technical Resource Guide for OCC ( [HTML](https://community.oracle.com/docs/DOC-1038707) )
- Generic Payment Gateway Integration ( [HTML](https://docs.oracle.com/en/cloud/saas/cx-commerce/20c/ccdev/create-generic-payment-gateway-integration1.html) )
- Payment Integration with OCC ( [HTML](https://community.oracle.com/docs/DOC-1032741) )
- OCC Payment FAQ ( [HTML](https://community.oracle.com/docs/DOC-1032746) )
- SSE Development Best Practices ( [HTML](https://community.oracle.com/groups/oracle-commerce-cloud-group/blog/2018/11/08/server-side-extension-development-best-practices) )
- Developing Widgets in OCC ( [HTML](https://docs.oracle.com/en/cloud/saas/cx-commerce/20c/widge/create-widget1.html) )
- Cybersource REST API Reference ( [HTML](https://developer.cybersource.com/api-reference-assets/index.html) )