import express from 'express';
import configureApp from './app';

const app = express();

configureApp(app);

module.exports = app;
