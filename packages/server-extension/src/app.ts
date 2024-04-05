import { Application } from 'express';
import nconf from 'nconf';
import path from 'path';
import allRoutes from './controllers';
import contextLoaderMiddleware from './middlewares/contextLoader';
import errorMiddleware from './middlewares/errorHandler';
import gatewaySettings from './middlewares/gatewaySettings';
import loggerMiddleware from './middlewares/logger';
import merchantConfig from './middlewares/merchantConfig';
import validateWebhookMiddleware from './middlewares/validateWebhook';
import { CHANNEL_REGEX } from './common';
const { LogFactory } = require('@isv-occ-payment/occ-payment-factory');
const logger = LogFactory.logger();

function loadConfiguration(app: Application) {
  if (app.locals.env !== 'development') {
    nconf.file({ file: path.join(__dirname, '../config/app.prod.json') });
  }
}

export default function configureApp(app: Application, baseRoutePath = '') {
  loadConfiguration(app);
  app.use((req, res, next) => {
    res.setHeader('X-Frame-Options', 'same-origin');
    next();
  })

  app.use((req, res, next) => {
    const { MD } = req.body;
    if (MD && 'string' === typeof MD) {
      res.removeHeader('X-frame-Options');
      logger.debug('Md data: ' + encodeURI(MD));
      const match = MD.match(CHANNEL_REGEX);
      const headerChannel = match ? match[1] : null;
      logger.debug('channel- ' + headerChannel);
      if (headerChannel)
        req.headers['channel'] = headerChannel;
    }
    next();
  })

  app.use(contextLoaderMiddleware);
  app.use(loggerMiddleware);
  app.use(validateWebhookMiddleware);

  app.use(gatewaySettings, merchantConfig);

  if (baseRoutePath) {
    allRoutes.use(baseRoutePath, allRoutes);
  }

  app.use(allRoutes);

  app.use(errorMiddleware);
}
