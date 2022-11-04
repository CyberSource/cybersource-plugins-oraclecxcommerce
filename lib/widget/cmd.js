//cmd.js
/* eslint-disable @typescript-eslint/no-var-requires */

const occ = require('./occ');
const util = require('./util');
const common = require('../common/occ');

/**
 * Create new extension id
 *
 * @param  {string}  url    The base URL, or hostname.
 * @param  {string}  appKey The application key obtained from CX Commerce Admin server.
 * @param  {string}  extensionName    The extension name.
 */
async function createExtensionId(extensionName, options) {
  const accessToken = await common.login(options.url, options.appKey);
  return await occ.createApplicationId(options.url, accessToken, extensionName);
}

/**
 * Create extension archive
 *
 * @param  {string}  extensionName    The extension name.
 */
async function packageExtension(extensionName, excludedDirs) {
  const extensionPath = `./packages/${extensionName}/`;
  const archiveFile = `./packages/${extensionName}.zip`;
  const response = await util.createArchive(extensionPath, archiveFile, excludedDirs);
  return response;
}

/**
 * Import CX Commerce Storefront extension to host
 *
 * @param  {string}  extensionName  The extension name.
 * @param  {string}  option         Command options.
 */
async function uploadExtension(extensionName, options) {
  //Login with password credentials
  const accessToken = await common.login(options.url, options.appKey);
  // Create new extension id
  const extensionId = await occ.createApplicationId(options.url, accessToken, extensionName);
  console.log(`extension id: ${extensionId}`);
  // Update extension JSON file with new extension ID
  let response = await util.updateExtensionJSON(extensionName, extensionId);
  console.log(response);
  //Create archive
  response = await packageExtension(extensionName, options.exclude);
  console.log(response);
  //Post extension archive to CX Commerce host
  const token = await common.uploadFile(
    options.url,
    accessToken,
    `/extensions/${extensionName}.zip`
  );
  console.log(`token: ${token}`);
  //Open extension archive and base64 encode contents
  const extensionPath = `./packages/${extensionName}.zip`;
  const base64String = await common.base64Encode(extensionPath);
  //console.log(`base64: ${base64String}`);
  //Import base64 encoded extension file referencing file token
  response = await common.doFileSegmentUpload(
    options.url,
    accessToken,
    token,
    `/extensions/${extensionName}.zip`,
    base64String
  );
  console.log(response);
  //Validate new extension
  response = await occ.createExtension(options.url, accessToken, `${extensionName}.zip`);

  return response;
}

/**
 * Process CX Commerce Storefront extension
 *
 * @param  {string}  url    The base URL, or hostname.
 * @param  {string}  appKey The application key obtained from CX Commerce Admin server.
 * @param  {string}  extensionName    The extension name.
 */
async function processExtension(extensionName, options) {
  //Get extension id from ext.json
  console.log(`Processing extension ${extensionName}`);
  const extensionId = options.extensionId || (await util.getExtensionId(extensionName));

  const accessToken = await common.login(options.url, options.appKey);

  const extensionExists = await findExtension(options, extensionName, extensionId);
  if (extensionExists) {
    //Process extension. Operation activate or deactivate
    const response = await occ.processExtension(options.url, accessToken, extensionId, options.op);
    return response;
  }
}

async function findExtension(options, extensionName, extensionId) {
  //Login with password credentials
  const accessToken = await common.login(options.url, options.appKey);
  const extensionList = await occ.listExtensions(options.url, accessToken);

  //Find extension by extensionId and return true if exists
  const item = extensionList['items'].find((item) => item.repositoryId === extensionId);

  if (item === undefined) {
    console.error(`Cannot find extension named ${extensionName} with id ${extensionId}`);
    return false;
  } else {
    return true;
  }
}

/**
 * Remove CX Commerce Storefront extension
 *
 * @param  {string}  extensionName    The extension name.
 */
async function removeExtension(extensionName, options) {
  //Get extension id from ext.json
  const extensionId = options.extensionId || (await util.getExtensionId(extensionName));

  const accessToken = await common.login(options.url, options.appKey);

  const extensionExists = await findExtension(options, extensionName, extensionId);

  if (extensionExists) {
    //Process extension. Operation activate or deactivate
    let response = await occ.processExtension(options.url, accessToken, extensionId, 'deactivate');
    console.log(response);
    //Delete extension
    response = await occ.deleteExtension(options.url, accessToken, extensionId);
    return response;
  }
}

async function findExtensionId(options, extensionName) {
  //Login with password credentials
  const accessToken = await common.login(options.url, options.appKey);
  const extensionList = await occ.listExtensions(options.url, accessToken);

  //Find extension by name and return repositoryId
  const extension = extensionList['items'].find(
    (item) => item.name == extensionName && item.enabled === true
  );

  if (extension) {
    return extension.repositoryId;
  }
}

module.exports = {
  createExtensionId,
  packageExtension,
  uploadExtension,
  processExtension,
  removeExtension,
  findExtensionId
};
