'use strict';

const program = require('commander');
const cmd = require('../../lib/sse/cmd');

// List server-side extension custom apps on CX Commerce server
// $ occ list-apps --url <host> --appKey <appKey>
// $ occ ls -u <host> -k <appKey>
program
  .command('list-apps') // sub-command name
  .requiredOption('-u, --url <url>', 'The url to your CX Commerce host.')
  .requiredOption('-k, --appKey <appKey>', 'The application key.')
  .description('List server-side extension custom apps on CX Commerce server') // command description
  // function to execute when command invoked
  .action(async (options) => {
    const response = await cmd.listApps(options);
    console.log(JSON.stringify(response));
  });

// Create server-side extension archive
// $ occ package-app <appName>
program
  .command('package-app <appName>') // sub-command name
  .description('Create server-side extension archive') // command description
  // function to execute when command invoked
  .action(async (appName) => {
    const response = await cmd.packageApp(appName);
    console.log(JSON.stringify(response));
  });

// Upload server-side extension custom app to CX Commerce server
// $ occ upload-app <appName> --url <host> --appKey <appKey>
// $ occ ls -u <host> -k <appKey> --a <appName>
program
  .command('upload-app <appName>') // sub-command name
  .requiredOption('-u, --url <url>', 'The url to your CX Commerce host.')
  .requiredOption('-k, --appKey <appKey>', 'The application key.')
  .option(
    '-x, --exclude <items>',
    'List of directories excluded from zip package',
    (value) => value.split(','),
    []
  )
  .description('Upload server-side extension custom app to CX Commerce server') // command description
  // function to execute when command invoked
  .action(async (appName, options) => {
    const response = await cmd.uploadApp(appName, options);
    console.log(response);
  });

// Get server-side extension log
// $ occ server-log --url <host> --appKey <appKey>
// $ occ server-log -u <host> -k <appKey>
program
  .command('server-log') // sub-command name
  .requiredOption('-u, --url <url>', 'The url to your CX Commerce host.')
  .requiredOption('-k, --appKey <appKey>', 'The application key.')
  .option(
    '-d, --date [date]',
    'The date of the log file to return. Will default to the current day if not supplied.'
  )
  .option(
    '-l, --loggingLevel [loggingLevel]',
    'The level of the log file to return. must be one of the following; debug, info, warning, error.',
    'debug'
  )
  .description('Get server-side extension logs') // command description
  // function to execute when command invoked
  .action(async (options) => {
    const response = await cmd.getServerLogs(options);
    console.log(response);
  });

// Returns the tail logs from the extension server for the given logging level and date.
// $ occ tail-log --url <host> --appKey <appKey>
// $ occ tail-log -u <host> -k <appKey>
program
  .command('tail-log') // sub-command name
  .requiredOption('-u, --url <url>', 'The url to your CX Commerce host.')
  .requiredOption('-k, --appKey <appKey>', 'The application key.')
  .option(
    '-d, --date [date]',
    'The date of the log file to return. Will default to the current day if not supplied.'
  )
  .option(
    '-l, --loggingLevel [loggingLevel]',
    'The level of the log file to return. must be one of the following; debug, info, warning, error.',
    'debug'
  )
  .description('Tail server-side extension logs') // command description
  // function to execute when command invoked
  .action(async (options) => {
    const response = await cmd.getServerLogTail(options);
    console.log(response);
  });

// Download server-side extension custom app files
// $ occ download-app <appName> --url <host> --appKey <appKey>
// $ occ download-app <appName> -u <host> -k <appKey>
program
  .command('download-app <appName>') // sub-command name
  .requiredOption('-u, --url <url>', 'The url to your CX Commerce host.')
  .requiredOption('-k, --appKey <appKey>', 'The application key.')
  .description('Download server-side custom app files') // command description
  // function to execute when command invoked
  .action(async (appName, options) => {
    const response = await cmd.downloadApp(appName, options);
    console.log(response);
  });

// List custom app routes
// $ occ list-routes [appName] --url <host> --appKey <appKey>
program
  .command('list-routes [appName]') // sub-command name
  .requiredOption('-u, --url <url>', 'The url to your CX Commerce host.')
  .requiredOption('-k, --appKey <appKey>', 'The application key.')
  .description('List custom app routes') // command description
  // function to execute when command invoked
  .action(async (appName, options) => {
    const response = await cmd.listRoutes(appName, options);
    console.log(response);
  });

// List environment variables
// $ occ config:list --url <host> --appKey <appKey>
program
  .command('config:list') // sub-command name
  .requiredOption('-u, --url <url>', 'The url to your CX Commerce host.')
  .requiredOption('-k, --appKey <appKey>', 'The application key.')
  .description('List environment variables') // command description
  // function to execute when command invoked
  .action(async (options) => {
    const response = await cmd.getEnvironmentVariables(options);
    console.log(JSON.stringify(response));
  });

// Set environment variables
// $ occ config:set --url <host> --appKey <appKey> <var> [otherVars]
program
  .command('config:set <envVar> [otherEnvVars...]') // sub-command name
  .requiredOption('-u, --url <url>', 'The url to your CX Commerce host.')
  .requiredOption('-k, --appKey <appKey>', 'The application key.')
  .description('Set environment variables') // command description
  // function to execute when command invoked
  .action(async (envVar, otherEnvVars, options) => {
    const response = await cmd.setEnvironmentVariables(envVar, otherEnvVars, options);
    console.log(JSON.stringify(response));
  });

// Unset environment variables
// $ occ config:unset --url <host> --appKey <appKey> <var> [otherVars]
program
  .command('config:unset <envVar> [otherEnvVars...]') // sub-command name
  .requiredOption('-u, --url <url>', 'The url to your CX Commerce host.')
  .requiredOption('-k, --appKey <appKey>', 'The application key.')
  .description('Set environment variables') // command description
  // function to execute when command invoked
  .action(async (envVar, otherEnvVars, options) => {
    const response = await cmd.deleteEnvironmentVariables(envVar, otherEnvVars, options);
    console.log(JSON.stringify(response));
  });

// Run tests
// $ occ run-tests <appName> --url <host> --appKey <appKey>
program
  .command('run-tests <appName>') // sub-command name
  .requiredOption('-u, --url <url>', 'The url to your CX Commerce host.')
  .requiredOption('-k, --appKey <appKey>', 'The application key.')
  .option('-i, --interval [interval]', 'Interval to wait between polling for results.', 10)
  .option('-t, --maxAttempts [maxAttempts]', 'Total number of attempts.', 5)
  .description('Run tests') // command description
  // function to execute when command invoked
  .action(async (appName, options) => {
    const response = await cmd.runTests(appName, options);
    console.log(JSON.stringify(response));
  });

// Upload Apple Pay domain association file
// $ occ upload-apple-domain-association <file>
program
  .command('upload-apple-domain-association <filePath>')
  .requiredOption('-u, --url <url>', 'The url to your CX Commerce host.')
  .requiredOption('-k, --appKey <appKey>', 'The application key.')
  .description('Upload Apple Pay domain association file')
  .action(async (filePath, options) => {
    const response = await cmd.uploadAppleDomainAssociation(filePath, options);
    console.log(JSON.stringify(response));
  });

// Get Custom Site Settings Config Data
// $ occ settings:list <gatewayId>
program
  .command('settings:list <gatewayId>')
  .requiredOption('-u, --url <url>', 'The url to your CX Commerce host.')
  .requiredOption('-k, --appKey <appKey>', 'The application key.')
  .description('Get Custom Site Settings. Get site settings by ID.')
  .action(async (gatewayId, options) => {
    const response = await cmd.getSiteSettings(gatewayId, options);
    console.log(JSON.stringify(response));
  });

// Set Site Setting Config Data
// $ occ settings:set <gatewayId>
program
  .command('settings:set <gatewayId> <payload>')
  .requiredOption('-u, --url <url>', 'The url to your CX Commerce host.')
  .requiredOption('-k, --appKey <appKey>', 'The application key.')
  .description('Update a Site Settings based on ID and request parameters.')
  .action(async (gatewayId, payload, options) => {
    const response = await cmd.setSiteSettings(gatewayId, payload, options);
    console.log(JSON.stringify(response));
  });
