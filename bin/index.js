'use strict';

const program = require('commander');

require('./widget/commands');
require('./sse/commands');

// Allow commander to parse `process.argv`
program.parse(process.argv);
