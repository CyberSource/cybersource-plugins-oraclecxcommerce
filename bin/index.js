'use strict';

const program = require('commander');
require('./sse/commands');
require('./widget/commands');

// Allow commander to parse `process.argv`
program.parse(process.argv);

const globalPromiseRejectionHandler = (error) => {
    console.log("Rejection reason: ");
    console.error(error);
}
process.on("unhandledRejection", globalPromiseRejectionHandler)
