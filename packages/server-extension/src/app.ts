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
    // Add Content-Security-Policy for additional frame protection
    res.setHeader('Content-Security-Policy', "frame-ancestors 'self'");
    next();
  })

  app.use((req, res, next) => {
    const { MD } = req.body;
    if (MD && 'string' === typeof MD) {
      logger.debug('Md data: ' + encodeURI(MD));
      const match = MD.match(CHANNEL_REGEX);
      const headerChannel = match ? match[1] : null;
      logger.debug('channel- ' + headerChannel);

      // Only remove X-Frame-Options for specific 3DS callback endpoints
      // and only if MD contains valid channel information
      const is3DSCallbackEndpoint = req.path === '/returnUrl' || req.path.endsWith('/payerAuth/returnUrl');

      if (is3DSCallbackEndpoint && headerChannel) {
        // Validate MD format - it should contain channel and be properly structured
        // MD parameter in 3DS flows typically contains base64-encoded data with channel info
        if (MD.length > 10 && MD.length < 10000 && /^[A-Za-z0-9+/=_-]+$/.test(MD)) {
          res.removeHeader('X-frame-Options');
          // Allow framing only from specific 3DS provider domains for CSP
          res.setHeader('Content-Security-Policy', "frame-ancestors 'self' https://*.cardinalcommerce.com https://*.cybersource.com");
          logger.debug('X-Frame-Options removed for validated 3DS callback');
        } else {
          logger.debug('Invalid MD format detected, keeping frame protection');
        }
      }

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
