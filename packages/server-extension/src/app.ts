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
import ConsoleLogger from './common/logging/consoleLogger';
import OccLogger from './common/logging/occLogger';

// TODO:
declare global {
  var logger : any
}

function loadConfiguration(app: Application) {
  if (app.locals.env !== 'development') {
    nconf.file({ file: path.join(__dirname, '../config/app.prod.json') });
    global.logger = new OccLogger();
  } else {
    global.logger = new ConsoleLogger();
  }
}

export default function configureApp(app: Application, baseRoutePath = '') {
  loadConfiguration(app);


  app.use(contextLoaderMiddleware);
  app.use(loggerMiddleware);
  app.use(validateWebhookMiddleware);

  //added header
  app.use((req, res, next)=>{
    res.setHeader("X-Frame-Options", "same-origin");
    next();
  })

  app.use(gatewaySettings, merchantConfig);

  if (baseRoutePath) {
    allRoutes.use(baseRoutePath, allRoutes);
  }

  app.use(allRoutes);

  app.use(errorMiddleware);
}
