import { asyncMiddleware, RequestContext, validateRequest } from '@server-extension/common';
import { getDailyReport, getOnDemandReport } from '@server-extension/services/payments/reports';
import { NextFunction, Request, Response, Router } from 'express';
import { checkSchema } from 'express-validator';
import { dailySchema, onDemandSchema } from './validation/reportSchema';

const router = Router();

router.get(
  '/daily',
  checkSchema(dailySchema),
  validateRequest,
  asyncMiddleware(async (req: Request, res: Response, _next: NextFunction) => {
    const date = new Date(req.query.date as string);
    const requestContext = <RequestContext>req.app.locals;

    const response = await getDailyReport(date, requestContext);

    res.json(response);
  })
);

router.get(
  '/onDemand',
  checkSchema(onDemandSchema),
  validateRequest,
  asyncMiddleware(async (req: Request, res: Response, _next: NextFunction) => {
    const startDate = req.query.startTime ? new Date(req.query.startTime as string) : undefined;
    const endDate = req.query.endTime ? new Date(req.query.endTime as string) : undefined;
    const requestContext = <RequestContext>req.app.locals;

    const response = await getOnDemandReport(requestContext, startDate, endDate);

    res.json(response);
  })
);

export default router;
