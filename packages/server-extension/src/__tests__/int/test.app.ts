import bodyParser from 'body-parser';
import express from 'express';
import nconf from 'nconf';
import path from 'path';
import { createLogger, Logger, transports } from 'winston';
import configureApp from '../../app';

process.env.NODE_ENV = 'development';

const TEST_CONFIG_PATH = path.join(__dirname, '../../../config/app.local.json');
nconf
  .overrides({
    'logging.api.error': false,
    'logging.api.access': false
  })
  .file({ file: TEST_CONFIG_PATH })
  .argv()
  .env();

const app = express();

//Initialize new logger for local test env
const logger: Logger = createLogger({
  levels: {
    error: 0,
    warning: 1,
    info: 2,
    debug: 3
  },
  transports: [new transports.Console({ level: 'debug' })]
});

//Set logger to res.locals in sub-app to duplicate how setup on server
app.use(function (_req, res, next) {
  res.locals = res.locals || {};
  res.locals.logger = logger;

  next();
});

// Enable 'bodyParser' for dev environment
app.use(bodyParser.json());

configureApp(app, '/ccstorex/custom');

export default app;
