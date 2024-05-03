import { RequestContext, asyncMiddleware, maskRequestData } from '@server-extension/common';
import { NextFunction, Request, Response, Router } from 'express';
import getPayerAuthSetup from '@server-extension/services/payments/payerAuthSetupService';
const { LogFactory } = require('@isv-occ-payment/occ-payment-factory');
const router = Router();
const logger = LogFactory.logger();

router.post('/setup', asyncMiddleware(
  async (req: Request, res: Response, _next: NextFunction) => {
    const setupRequest: OCC.PayerAuthSetupRequest = req.body;
    const requestContext: RequestContext = req.app.locals;
    logger.debug('Payer Auth Setup Request: ' + JSON.stringify(maskRequestData(setupRequest)));
    const response = await getPayerAuthSetup(setupRequest, requestContext);

    logger.debug('Payer Auth Setup Response: ' + JSON.stringify(maskRequestData(response)));
    res.json(response);
  })
);

router.post('/returnUrl', (req: Request, res: Response) => {
  const transactionValidationId = JSON.stringify(req.body?.TransactionId); 
  res.send(`<script>
  let transactionId = '${transactionValidationId}'; 
  let messageObj = { 'messageType':'transactionValidation', 'message': transactionId }; 
  window.parent.postMessage(messageObj, \'*\'); </script> `);
});

export default router;
