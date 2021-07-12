import { asyncMiddleware } from '@server-extension/common';
import { NextFunction, Request, Response, Router } from 'express';
import { dispatcher } from '../services/payments';

const router = Router();

router.post(
  '/',
  asyncMiddleware(async (req: Request, res: Response, _next: NextFunction) => {
    const response = await dispatcher.dispatchFrom(req);

    res.json(response);
  })
);

export default router;
