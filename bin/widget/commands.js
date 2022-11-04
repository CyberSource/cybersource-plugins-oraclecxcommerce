'use strict';
// index.js
/* eslint-disable @typescript-eslint/no-var-requires */

const program = require('commander');
const cmd = require('../../lib/widget/cmd');

// Create extension id
// $ occ create-extension-id <extensionName> --url <host> --username <username> --password <password>
program
  .command('create-extension-id <extensionName>') // sub-command name
  .requiredOption('-u, --url <url>', 'The url to your CX Commerce host.')
  .requiredOption('-k, --appKey <appKey>', 'The application key.')
  .description('Create CX Commerce Storefront extension id') // command description
  // function to execute when command invoked
  .action(async (extensionName, options) => {
    const response = await cmd.createExtensionId(extensionName, options);
    console.log(response);
  });

// Import CX Commerce Storefront extension to host
// $ occ upload-extension <extensionName> --url <host> --appKey <appKey>
program
  .command('upload-extension <extensionName>') // sub-command name
  .requiredOption('-u, --url <url>', 'The url to your CX Commerce host.')
  .requiredOption('-k, --appKey <appKey>', 'The application key.')
  .option('-e, --extensionId [extensionId]', 'Extension id to add.')
  .option(
    '-x, --exclude <items>',
    'List of directories excluded from zip package',
    (value) => value.split(','),
    []
  )
  .description('Import CX Commerce Storefront extension to host') // command description
  // function to execute when command invoked
  .action(async (extensionName, options) => {
    const response = await cmd.uploadExtension(extensionName, options);
    console.log(response);
  });

// Create extension archive
// $ occ package-extension <extensionName>
program
  .command('package-extension <extensionName>') // sub-command name
  .description('Create extension archive') // command description
  .option(
    '-x, --exclude <items>',
    'List of directories excluded from zip package',
    (value) => value.split(','),
    []
  )
  // function to execute when command invoked
  .action(async (extensionName, options) => {
    const response = await cmd.packageExtension(extensionName, options.exclude);
    console.log(response);
  });

// Deactivate CX Commerce Storefront extension
// $ occ deactivate-extension <extensionName> --url <host> --appKey <appKey> --op [activate | deactivate]
program
  .command('deactivate-extension <extensionName>') // sub-command name
  .requiredOption('-u, --url <url>', 'The url to your CX Commerce host.')
  .requiredOption('-k, --appKey <appKey>', 'The application key.')
  .requiredOption('-o, --op [op]', 'The operation to perform.', 'deactivate')
  .option('-e, --extensionId [extensionId]', 'Extension id to add.')
  .description('Deactivate CX Commerce Storefront extension') // command description
  // function to execute when command invoked
  .action(async (extensionName, options) => {
    const response = await cmd.processExtension(extensionName, options);
    console.log(response);
  });

// Activate CX Commerce Storefront extension
// $ occ activate-extension <extensionName> --url <host> --appKey <appKey> --op [activate | deactivate]
program
  .command('activate-extension <extensionName>') // sub-command name
  .requiredOption('-u, --url <url>', 'The url to your CX Commerce host.')
  .requiredOption('-k, --appKey <appKey>', 'The application key.')
  .requiredOption('-o, --op [op]', 'The operation to perform.', 'activate')
  .description('Activate CX Commerce Storefront extension') // command description
  // function to execute when command invoked
  .action(async (extensionName, options) => {
    const response = await cmd.processExtension(extensionName, options);
    console.log(response);
  });

// Remove CX Commerce Storefront extension
// $ occ remove-extension <extensionName> --url <host> --appKey <appKey> --op [activate | deactivate]
program
  .command('remove-extension <extensionName>') // sub-command name
  .requiredOption('-u, --url <url>', 'The url to your CX Commerce host.')
  .requiredOption('-k, --appKey <appKey>', 'The application key.')
  .option('-e, --extensionId [extensionId]', 'Extension id to add.')
  .description('Remove CX Commerce Storefront extension') // command description
  // function to execute when command invoked
  .action(async (extensionName, options) => {
    const response = await cmd.removeExtension(extensionName, options);
    console.log(response);
  });

// List CX Commerce Storefront extension
// $ occ find-extension-id --url <host> --appKey <appKey> <extensionName>
program
  .command('find-extension-id <extensionName>') // sub-command name
  .requiredOption('-u, --url <url>', 'The url to your CX Commerce host.')
  .requiredOption('-k, --appKey <appKey>', 'The application key.')
  .description('Remove CX Commerce Storefront extension') // command description
  // function to execute when command invoked
  .action(async (extensionName, options) => {
    const response = await cmd.findExtensionId(options, extensionName);
    console.log(response);
  });
