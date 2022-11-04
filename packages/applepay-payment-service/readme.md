# Oracle Commerce Demo Payment Service 
Package includes CX Commerce demonstration payment service implementation.

## Introduction
This payment service can be used to demonstrate processing available Commerce transaction types.

## Processors
Payment service includes the following processors:

### Authorization Processor
This processor executes *authorization* transactions which are denoted by the codes `auth` or `0100`.
The processor applies three middleware functions, in order:
- preProcessResponse - update response with initial values
- getExchangeRates - Adds all current exchange rates as key/value pairs to response additionalProperties
- updateAuthorization - Adds transaction authorization to response

