import express from 'express';
import configureApp from '@isv-occ-payment/server-extension/cjs/app';

const app = express();

configureApp(app);

module.exports = app;
