import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import fs from 'fs';
import http from 'http';
import https from 'https';
import nconf from 'nconf';
import path from 'path';
import { createLogger, Logger, transports } from 'winston';
import configureApp from '@isv-occ-payment/server-extension/src/app';

const app = express();
app.locals.env = 'development';

//Initialize new logger for local env
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

// Enable All CORS Requests
app.use(cors());

// Enable 'bodyParser' for dev environment
app.use(bodyParser.json());

nconf
  .file({ file: path.join(__dirname, '../../server-extension/config/app.local.json') })
  .argv()
  .env();

configureApp(app, '/ccstorex/custom');

// Read port from config, or default
const port = process.env.npm_package_config_port || 3000;
const sslPort = process.env.npm_package_config_ssl_port || 3001;

const httpServer = http.createServer(app);
const httpsServer = https.createServer(
  {
    key: fs.readFileSync('../../certs/localhost.key'),
    cert: fs.readFileSync('../../certs/localhost.crt')
  },
  app
);

httpServer.listen(port, function () {
  logger.info(`Listening on PORT ${port}...`);
});

httpsServer.listen(sslPort, () => {
  logger.info(`[SSL] Listening on PORT ${sslPort}...`);
});
