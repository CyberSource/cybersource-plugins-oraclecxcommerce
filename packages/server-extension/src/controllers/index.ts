import { Router} from 'express';
import flex from './flex';
import paymentMethods from './paymentMethods';
import applePay from './applePay';
import payerAuth from './payerAuth';
import paymentCapture from './paymentCapture';
import paymentRefund from './paymentRefund';
import report from './report';
import webhookRouter from './webhookRouter';
import payments from './payments';

const router = Router();
router.use('/v2/keys', flex);
router.use('/v2/paymentMethods', paymentMethods);
router.use('/v2/applepay', applePay);
router.use('/v2/payerAuth', payerAuth);
router.use('/v2/capture', paymentCapture);
router.use('/v2/refund', paymentRefund);
router.use('/v2/report', report);
router.use('/v2/webhook', webhookRouter);
router.use('/v2/payments',payments);

const allRoutes = router.use('/isv-payment', router);

export default allRoutes;
