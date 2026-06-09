import { RequestContext, asyncMiddleware, maskRequestData } from '@server-extension/common';
import { NextFunction, Request, Response, Router } from 'express';
import getPayerAuthSetup from '@server-extension/services/payments/payerAuthSetupService';
const { LogFactory } = require('@isv-occ-payment/occ-payment-factory');
const router = Router();
const logger = LogFactory.logger();

router.post('/setup', asyncMiddleware(
  async (req: Request, res: Response, _next: NextFunction) => {
    const setupRequest: OCC.PayerAuthSetupRequest = req.body;
    const requestContext: RequestContext = res.locals.requestContext as RequestContext;
    logger.debug('Payer Auth Setup Request: ' + JSON.stringify(maskRequestData(setupRequest)));
    const response = await getPayerAuthSetup(setupRequest, requestContext);

    logger.debug('Payer Auth Setup Response: ' + JSON.stringify(maskRequestData(response)));
    res.json(response);
  })
);

/**
 * Validates that a transaction ID matches expected format
 * Prevents XSS by ensuring only safe characters are present
 * @param transactionId The transaction ID to validate
 * @returns true if valid, false otherwise
 */
function isValidTransactionId(transactionId: any): boolean {
  if (!transactionId || typeof transactionId !== 'string') {
    return false;
  }

  // Transaction IDs should be alphanumeric with hyphens, underscores, and periods
  // Typical formats: UUIDs, base64-encoded values, alphanumeric identifiers
  // Length: 1-500 characters (reasonable for transaction IDs)
  const validPattern = /^[a-zA-Z0-9_\-\.=]+$/;

  return (
    transactionId.length > 0 &&
    transactionId.length <= 500 &&
    validPattern.test(transactionId)
  );
}

/**
 * HTML-escapes a string for safe insertion into HTML attributes
 * @param str String to escape
 * @returns HTML-escaped string
 */
function escapeHtml(str: string): string {
  const htmlEscapeMap: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };

  return str.replace(/[&<>"'\/]/g, (char) => htmlEscapeMap[char]);
}

router.post('/returnUrl', (req: Request, res: Response) => {
  const transactionId = req.body?.TransactionId;

  // Validate transaction ID format to prevent XSS
  if (!isValidTransactionId(transactionId)) {
    logger.debug(`Invalid transaction ID format rejected: ${typeof transactionId} ${transactionId?.substring?.(0, 50)}`);
    res.status(400).send('Invalid transaction ID format');
    return;
  }

  // HTML-escape the transaction ID for safe insertion into data attribute
  const safeTransactionId = escapeHtml(transactionId);

  // Set Content-Security-Policy header to restrict inline script execution
  res.setHeader('Content-Security-Policy', "default-src 'none'; script-src 'unsafe-inline'; frame-ancestors 'self' https://*.cardinalcommerce.com https://*.cybersource.com");

  // Use data attribute approach to avoid interpolating user input into JavaScript
  // The transaction ID is placed in an HTML data attribute (HTML-escaped)
  // and read by a static script, eliminating XSS risk
  res.send(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>3D Secure Authentication</title>
</head>
<body>
  <div id="auth-result" data-transaction-id="${safeTransactionId}"></div>
  <script>
    (function() {
      // Read transaction ID from data attribute (safe from XSS)
      var element = document.getElementById('auth-result');
      var transactionId = element.getAttribute('data-transaction-id');

      // Send message to parent window
      var messageObj = {
        messageType: 'transactionValidation',
        message: transactionId
      };

      if (window.parent && window.parent !== window) {
        window.parent.postMessage(messageObj, '*');
      }
    })();
  </script>
</body>
</html>`);
});

export default router;
