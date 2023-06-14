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
  //added header
  app.use((req, res, next)=>{
    res.setHeader("X-Frame-Options", "same-origin");
    next();
  })

  app.use((req, res, next) => {
    const { MD } = req.body;
    if (MD && typeof MD === "string") {
      res.removeHeader('X-frame-Options');
      console.log('Md data: '+MD);
      const channelRegex = /channel=([^,]+)/i;
      const match = MD.match(channelRegex);
      const headerChannel =  match ? match[1]:null;
       console.log("channel-", headerChannel);
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
