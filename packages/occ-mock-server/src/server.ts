import fs from 'fs';
import http from 'http';
import https from 'https';
import jsonServer from 'json-server';
import path from 'path';
import customRoutes from './routes';

const server = jsonServer.create();
const jsonServerRouter = jsonServer.router(path.join(__dirname, 'data/db.json'));
const middlewares = jsonServer.defaults({
  bodyParser: true,
  noCors: false
});

server.use(middlewares);

server.use(customRoutes as any);

server.use(
  jsonServer.rewriter({
    '/api/*': '/$1'
  })
);

server.use(jsonServerRouter);

// Read port from config, or default
const port = process.env.npm_package_config_port || 5000;
const sslPort = process.env.npm_package_config_ssl_port || 5001;

const httpServer = http.createServer(server);
const httpsServer = https.createServer(
  {
    key: fs.readFileSync('../../certs/localhost.key'),
    cert: fs.readFileSync('../../certs/localhost.crt')
  },
  server
);

httpServer.listen(port, () => console.log(`Listening on PORT ${port}...`));
httpsServer.listen(sslPort, () => console.log(`Listening on [SSL] PORT ${sslPort}...`));
