import { PaymentContext } from '@server-extension/common';
import { CreatePaymentRequest } from 'cybersource-rest-client';
import { PaymentRequestMapper } from '../../common';

const { LogFactory } = require('@isv-occ-payment/occ-payment-factory');
const logger = LogFactory.logger();

// Allowed fields for line items based on CyberSource SDK types
const ALLOWED_LINE_ITEM_FIELDS = new Set([
  'productCode',
  'productName',
  'productSku',
  'quantity',
  'unitPrice',
  'taxAmount',
  'totalAmount',
  'discountAmount',
  'commodityCode',
  'productDescription'
]);

/**
 * Validates a line item object to ensure it only contains allowed fields with correct types
 * @param item The line item to validate
 * @returns Sanitized line item or null if invalid
 */
function validateAndSanitizeLineItem(item: any): any | null {
  if (!item || typeof item !== 'object' || Array.isArray(item)) {
    logger.debug('Invalid line item: not an object');
    return null;
  }

  const sanitized: any = {};

  for (const [key, value] of Object.entries(item)) {
    // Only allow whitelisted fields
    if (!ALLOWED_LINE_ITEM_FIELDS.has(key)) {
      logger.debug(`Rejected disallowed field in line item: ${key}`);
      continue;
    }

    // Validate field types
    if (key === 'quantity') {
      if (typeof value === 'number' && Number.isInteger(value) && value >= 0) {
        sanitized[key] = value;
      } else {
        logger.debug(`Invalid quantity value: ${value}`);
      }
    } else if (['unitPrice', 'taxAmount', 'totalAmount', 'discountAmount'].includes(key)) {
      // Validate price fields are strings containing valid numbers
      if (typeof value === 'string' && /^\d+(\.\d{1,2})?$/.test(value)) {
        sanitized[key] = value;
      } else {
        logger.debug(`Invalid price field ${key}: ${value}`);
      }
    } else if (typeof value === 'string') {
      // Other fields should be strings
      sanitized[key] = value.substring(0, 255); // Limit string length
    }
  }

  return Object.keys(sanitized).length > 0 ? sanitized : null;
}

/**
 * Validates and sanitizes line items from user input
 * @param lineItemsStr JSON string containing line items
 * @returns Validated array of line items or null
 */
function parseAndValidateLineItems(lineItemsStr: string | null): any[] | null {
  if (!lineItemsStr || typeof lineItemsStr !== 'string') {
    return null;
  }

  try {
    const parsed = JSON.parse(lineItemsStr);

    // Ensure it's an array
    if (!Array.isArray(parsed)) {
      logger.debug('Line items is not an array after parsing');
      return null;
    }

    // Limit array size to prevent DoS
    if (parsed.length > 100) {
      logger.debug(`Line items array too large: ${parsed.length} items`);
      return null;
    }

    // Validate and sanitize each item
    const sanitized = parsed
      .map(validateAndSanitizeLineItem)
      .filter(item => item !== null);

    return sanitized.length > 0 ? sanitized : null;
  } catch (error) {
    logger.error(`Failed to parse line items: ${error.message}`);
    return null;
  }
}

/**
 * Validates and sanitizes subTotal value
 * @param subTotal User-provided subtotal
 * @returns Validated subtotal string or undefined
 */
function validateSubTotal(subTotal: any): string | undefined {
  if (!subTotal) {
    return undefined;
  }

  if (typeof subTotal === 'string' && /^\d+(\.\d{1,2})?$/.test(subTotal)) {
    return subTotal;
  }

  logger.debug(`Invalid subTotal format: ${subTotal}`);
  return undefined;
}

export const lineItemAndSubTotalMapper: PaymentRequestMapper = {
  supports: () => true,
  map: (context: PaymentContext) => {
    const { customProperties } = context.webhookRequest;

    // Validate and sanitize line items
    const lineItemDetails = parseAndValidateLineItems(customProperties?.lineItems || null);

    // Validate and sanitize subTotal
    const validatedSubTotal = validateSubTotal(customProperties?.subTotal);

    return <CreatePaymentRequest>{
      orderInformation: {
        amountDetails: {
          subTotalAmount: validatedSubTotal
        },
        lineItems: lineItemDetails
      }
    };
  }
};

