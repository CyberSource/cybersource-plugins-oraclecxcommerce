import express from 'express';
import flex from './flex';
import payments from './payment';
import paymentMethods from './paymentMethods';
import applePay from './applePay';
import payerAuth from './payerAuth';
import paymentCapture from './paymentCapture';
import paymentRefund from './paymentRefund';
import report from './report';

const router = express.Router();

router.use('/v1/keys', flex);
router.use('/v1/payments', payments);
router.use('/v1/paymentMethods', paymentMethods);
router.use('/v1/applepay', applePay);
router.use('/v1/payerAuth', payerAuth);
router.use('/v1/capture', paymentCapture);
router.use('/v1/refund', paymentRefund);
router.use('/v1/report', report);

const allRoutes = router.use('/isv-payment', router);

export default allRoutes;
