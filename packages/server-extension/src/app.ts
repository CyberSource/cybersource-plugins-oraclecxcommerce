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

function loadConfiguration() {
  if (process.env.NODE_ENV !== 'development') {
    nconf.file({ file: path.join(__dirname, '../config/app.prod.json') });
  }
}

export default function configureApp(app: Application, baseRoutePath = '') {
  loadConfiguration();

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
