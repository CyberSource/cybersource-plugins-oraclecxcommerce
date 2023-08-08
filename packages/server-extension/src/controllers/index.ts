import { Router, Request, Response, NextFunction } from 'express';

import flex from './flex';
import paymentMethods from './paymentMethods';
import applePay from './applePay';
import payerAuth from './payerAuth';
import paymentCapture from './paymentCapture';
import paymentRefund from './paymentRefund';
import report from './report';
import { paymentRouter } from '@server-extension/controllers/paymentRouter';
import { asyncMiddleware } from '@server-extension/common';

const router = Router();

router.use('/v2/keys', flex);
router.use('/v2/paymentMethods', paymentMethods);
router.use('/v2/applepay', applePay);
router.use('/v2/payerAuth', payerAuth);
router.use('/v2/capture', paymentCapture);
router.use('/v2/refund', paymentRefund);
router.use('/v2/report', report);

router.post('/v2/payerAuthReturnUrl',(req: Request,res: Response)=>{
  const transactionId = JSON.stringify(req.body?.TransactionId);
  res.send(`<script>
     window.parent.postMessage({
    'messageType':'transactionValidation',
    'message':'${transactionId}'
  },'*');
  </script>`);

})

router.post('/v2/payments', asyncMiddleware(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {

  const replaceCharacterRegex = /~W!C@O#n/g;  

  const iterateCustomProperties = (obj: any) => {
    Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            iterateCustomProperties(obj[key])
        } else if(typeof obj[key] === "string") {
          obj[key] = obj[key].replace(replaceCharacterRegex, "=");
        }
    });
  };

  req.body.customProperties && iterateCustomProperties(req.body.customProperties);

  try {
    const response = await paymentRouter(req, res);
    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
}));

const allRoutes = router.use('/isv-payment', router);

export default allRoutes;
