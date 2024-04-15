import { asyncMiddleware, iterateCustomProperties } from "@server-extension/common";
import { paymentRouter } from '@server-extension/controllers/paymentRouter';
import { Router, Request, Response, NextFunction } from 'express';
const router = Router();

router.post('/', asyncMiddleware(
    async (req: Request, res: Response, _next: NextFunction) => {
    req.body.customProperties && iterateCustomProperties(req.body.customProperties);
    try {
      const response = await paymentRouter(req, res);
      res.status(200).json(response);
    } catch (err) {
      _next(err);
    }
  }));

  export default router;