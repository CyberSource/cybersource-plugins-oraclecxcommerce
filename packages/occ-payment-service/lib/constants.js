/*
 ** Copyright (c) 2020 Oracle and/or its affiliates.
 */
'use strict';

class ConstantsClass {}

ConstantsClass.APPLICATION_JSON = 'application/json';
ConstantsClass.CONTENT_TYPE = 'Content-Type';

ConstantsClass.CARD = 'card';
ConstantsClass.GENERIC = 'generic';

// transaction types
ConstantsClass.PAYMENT_TRANSACTION_TYPE_AUTHORIZE = '0100'; //Approve payment for an order
ConstantsClass.PAYMENT_TRANSACTION_TYPE_VOID = '0110'; //Cancel an order or a payment
ConstantsClass.PAYMENT_TRANSACTION_TYPE_CAPTURE = '0200'; //Settle a payment
ConstantsClass.PAYMENT_TRANSACTION_TYPE_REFUND = '0400'; //Issue a credit to the shopper after a return
ConstantsClass.PAYMENT_TRANSACTION_BALANCE_INQUIRY = '0600'; //Return current available balance
ConstantsClass.PAYMENT_TRANSACTION_INITIATE = '0800'; //Initiate order
ConstantsClass.PAYMENT_TRANSACTION_RETRIEVE = '0900'; //Retrieve order
ConstantsClass.PAYMENT_TRANSACTION_CASH_REQUEST = 'CASH REQUEST'; //Create an order to be completed later
ConstantsClass.PAYMENT_TRANSACTION_CASH_CANCEL = 'CASH CANCEL'; //Cancel an order or a payment
ConstantsClass.PAYMENT_TRANSACTION_INVOICE_AUTHORIZE = 'AUTHORIZE'; //Approve payment for an order

ConstantsClass.PAYMENT_TRANSACTION_NAME_AUTHORIZE = 'auth'; //Approve payment for an order
ConstantsClass.PAYMENT_TRANSACTION_NAME_VOID = 'void'; //Cancel an order or a payment
ConstantsClass.PAYMENT_TRANSACTION_NAME_CAPTURE = 'capture'; //Settle a payment
ConstantsClass.PAYMENT_TRANSACTION_NAME_REFUND = 'refund'; //Issue a credit to the shopper after a return
ConstantsClass.PAYMENT_TRANSACTION_NAME_BALANCE_INQUIRY = 'balance'; //Return current available balance
ConstantsClass.PAYMENT_TRANSACTION_NAME_INITIATE = 'initiate'; //Initiate order
ConstantsClass.PAYMENT_TRANSACTION_NAME_RETRIEVE = 'retrieve'; //Retrieve order
ConstantsClass.PAYMENT_TRANSACTION_NAME_CASH_REQUEST = 'cash-request'; //Create an order to be completed later
ConstantsClass.PAYMENT_TRANSACTION_NAME_CASH_CANCEL = 'cash-cancel'; //Cancel an order or a payment
ConstantsClass.PAYMENT_TRANSACTION_NAME_INVOICE_AUTHORIZE = 'invoice-auth'; //Approve payment for an order
ConstantsClass.PAYMENT_TRANSACTION_NAME_INVOICE_CANCEL = 'invoice-cancel'; //Approve payment for an order

// cybersource request configuration properties
ConstantsClass.COMMERCE_INDICATOR = 'internet';
ConstantsClass.INITIATOR_TYPE = 'customer';

// Cybersource payment status values
ConstantsClass.PAYMENT_STATUS_AUTHORIZE = 'AUTHORIZED';
ConstantsClass.PAYMENT_STATUS_DECLINED = 'DECLINED';

ConstantsClass.VOID_STATUS_REVERSED = 'REVERSED';
ConstantsClass.VOID_STATUS_ERROR = 'SERVER_ERROR';
ConstantsClass.VOID_STATUS_INVALID = 'INVALID_REQUEST';

// authcodes
ConstantsClass.AUTHCODE_AUTHORIZE = 'AUTH-ACCEPT';
ConstantsClass.AUTHCODE_DECLINE = 'AUTH-DECLINE';

// response codes
ConstantsClass.RESPONSE_CODE_AUTHORIZE = '1000';
ConstantsClass.RESPONSE_CODE_VOID_ACCEPT = '2000';
ConstantsClass.RESPONSE_CODE_VOID_REJECT = '8000';
ConstantsClass.RESPONSE_CODE_BALANCE_ACCEPT = '5000';
ConstantsClass.RESPONSE_CODE_BALANCE_REJECT = '6000';
ConstantsClass.RESPONSE_CODE_REFUND_ACCEPT = '3000';
ConstantsClass.RESPONSE_CODE_REFUND_REJECT = '7000';
ConstantsClass.RESPONSE_CODE_SETTLED = '4000';
ConstantsClass.RESPONSE_CODE_DECLINE = '9000';

// response reasons
ConstantsClass.RESPONSE_REASON_AUTHORIZE = 'The payment has been approved';
ConstantsClass.RESPONSE_REASON_SETTLED =
  'Funds have been received and transferred to merchant account';
ConstantsClass.RESPONSE_REASON_DECLINE = 'The payment has been declined';
ConstantsClass.RESPONSE_REASON_VOID = 'Payment authorization is reversed successfully';
ConstantsClass.RESPONSE_REASON_REFUND = 'Requested funds to be sent back to the shopper';

// error messages
ConstantsClass.NO_GATEWAY_SERVICE_FOUND = 'noGatewayServiceFound';
ConstantsClass.NO_RESPONSE = 'noResponse';
ConstantsClass.INVALID_TRANSACTION_TYPE_MESSAGE = 'invalidTransactionType';
ConstantsClass.INVALID_REQUEST_EMPTY_BODY = 'missingRequestBody';
ConstantsClass.INVALID_REQUEST_PAYMENT_METHOD = 'invalidPaymentMethod';
ConstantsClass.INVALID_REQUEST_CARD_DETAILS = 'missingCardDetails';
ConstantsClass.UNABLE_TO_AUTHORIZE_TOTAL_AMOUNT = 'authorizeTotalAmountError';
ConstantsClass.GENERAL_ERROR = 'generalError';
ConstantsClass.INVALID_REST_CLIENT = 'missingRestClient';

// status codes
ConstantsClass.INTERNAL_SERVER_ERROR = 500;

module.exports.Constants = ConstantsClass;
