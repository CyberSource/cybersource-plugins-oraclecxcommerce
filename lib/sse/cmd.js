//cmd.js

const occ = require('./occ');
const zip = require('./archive');
const common = require('../common/occ');

/**
 * List server-side extension custom apps
 *
 * @param  {string}  url    The base URL, or hostname.
 * @param  {string}  appKey The application key obtained from CX Commerce Admin server.
 */
async function listApps(options) {
  const accessToken = await common.login(options.url, options.appKey);
  const response = await occ.listSSEFiles(options.url, accessToken);
  return response;
}

/**
 * Create server-side extension archive
 *
 * @param  {string}  appName    The custom application name.
 */
async function packageApp(appName) {
  const extensionPath = `packages/occ-sse-gateway`;
  const archiveFile = `packages/${appName}.zip`;
  const excludedDirs = [
    'src/**',
    'lib/**',
    'html-reports/**',
    '**/node_modules/@isv-occ-payment/*/src/**',
    '**/node_modules/@isv-occ-payment/*/lib/**',
    '**/node_modules/@isv-occ-payment/payment-sdk/generator/**',
    '**/node_modules/@isv-occ-payment/payment-sdk/.swagger-codegen-ignore',
    'node_modules/winston/**',
    'node_modules/https-proxy-agent/**',  
    'node_modules/http-proxy-agent/**'
  ];

  console.log('Creating archive: ', archiveFile, 'from:', extensionPath);
  console.log('Excluding:', excludedDirs);

  const response = await zip.packageSSEExtension(extensionPath, archiveFile, excludedDirs);
  return response;
}

/**
 * Upload custom app to CX Commerce server
 *
 * @param  {string}  url        The base URL, or hostname.
 * @param  {string}  appKey     The application key obtained from CX Commerce Admin server.
 * @param  {string}  appName    The custom application name.
 */
async function uploadApp(appName, options) {
  process.env["NODE_TLS_REJECT_UNAUTHORIZED"]=0
  const accessToken = await common.login(options.url, options.appKey);
  const archiveFile = `./packages/${appName}.zip`;

  //Upload
  console.log('Uploading App', 'name:', appName, 'path:', archiveFile);

  const response = await occ.doSSEFileUploadMultipart(
    options.url,
    accessToken,
    appName,
    archiveFile
  );
  return response;
}

/**
 * Get server-side extension logs
 *
 * @param  {string}  url    The base URL, or hostname.
 * @param  {string}  appKey The application key obtained from CX Commerce Admin server.
 */
async function getServerLogs(options) {
  const accessToken = await common.login(options.url, options.appKey);
  const response = await occ.getExtensionServerLogs(
    options.url,
    accessToken,
    options.date,
    options.loggingLevel
  );
  return response;
}

/**
 * Tail server-side extension logs
 *
 * @param  {string}  url    The base URL, or hostname.
 * @param  {string}  appKey The application key obtained from CX Commerce Admin server.
 */
async function getServerLogTail(options) {
  const accessToken = await common.login(options.url, options.appKey);
  const response = await occ.getExtensionServerLogTail(
    options.url,
    accessToken,
    options.date,
    options.loggingLevel
  );
  return response;
}

/**
 * Get server-side extension custom app files
 *
 * @param  {string}  url    The base URL, or hostname.
 * @param  {string}  appKey The application key obtained from CX Commerce Admin server.
 * @param  {string}  appName    The custom application name.
 */
async function downloadApp(appName, options) {
  const accessToken = await common.login(options.url, options.appKey);
  const response = await occ.doDownloadSSEFile(options.url, accessToken, appName);
  return response;
}

/**
 * Get server-side extension custom app files
 *
 * @param  {string}  url    The base URL, or hostname.
 * @param  {string}  appKey The application key obtained from CX Commerce Admin server.
 * @param  {string}  appName    The custom application name.
 */
async function listRoutes(appName, options) {
  /**
   * {'items': [
   *      'name': 'Test'
   *      'filename': test.zip
   *      'publicUrls': [
   *           "/ccstorex/custom/v1/metrics",
   *           "/ccstorex/custom/v1/test"
   *       ],
   *      'authenticatedUrls': [
   *           "/ccadminx/custom/v1/test"
   *       ]
   *   ]
   * }
   */

  const accessToken = await common.login(options.url, options.appKey);

  let response = {
    items: []
  };
  let apps = [];

  if (appName == '' || appName === undefined) {
    // List all custom apps on server
    const response = await occ.listSSEFiles(options.url, accessToken);
    for (i = 0; i < response.items.length; i++) {
      appName = response.items[i].name.replace(/\.[^/.]+$/, '');
      apps.push(appName);
    }
  } else {
    apps.push(appName);
  }

  //Loop through all custom apps and download files
  for (i = 0; i < apps.length; i++) {
    console.log(`app.name = ${apps[i]}`);
    // Download app files
    const fileResponse = await occ.doDownloadSSEFile(options.url, accessToken, apps[i]);
    console.log(fileResponse.filename);
    //Open package
    const appUrls = await zip.streamArchivePackageToJson(fileResponse.filename);

    /*
        //Add to response
        let item = {}
        item['name'] = fileResponse.name;
        item['filename'] = fileResponse.filename;
        let a1 = item['publicUrls']=[];
        for (i=0; i < appUrls.publicUrls.length; i++) {
            a1.push(appUrls.publicUrls[i])
        }
        let a2 = item['authenticatedUrls']=[];
        for (i=0; i < appUrls.authenticatedUrls.length; i++) {
            a2.push(appUrls.authenticatedUrls[i])
        }
        console.log(item);
        //item['publicUrls'].splice.apply(appUrls.publicUrls);
        //item['authenticatedUrls'].push(appUrls.authenticatedUrls);

        response.items.push(item);
        */

    response.items.push({
      name: fileResponse.name,
      filename: fileResponse.filename,
      publicUrls: appUrls.publicUrls,
      authenticatedUrls: appUrls.authenticatedUrls
    });
  }

  return JSON.stringify(response);
  //return response;
  /*
    for (i=0; i < apps.items.length; i++) {
        let appName = apps.items[i].name.replace(/\.[^/.]+$/, "");
        console.log(`app.name = ${appName}`);

        // Download app files
        const archiveFile = await occ.doDownloadSSEFile(options.url, accessToken, appName);
        console.log(archiveFile);
    }                 
    */
}

/**
 * Get server-side extension environment variables
 *
 * @param  {string}  options    The url and application key.
 */
async function getEnvironmentVariables(options) {
  const accessToken = await common.login(options.url, options.appKey);
  const response = await occ.getEnvironmentVariables(options.url, accessToken);
  return response;
}

/**
 * Set server-side extension environment variables
 *
 * @param  {string}  options    The url and application key.
 */
async function setEnvironmentVariables(envVar, otherEnvVars, options) {
  //Login
  const accessToken = await common.login(options.url, options.appKey);

  //Get list of environment variables
  const result = await occ.getEnvironmentVariables(options.url, accessToken);
  const items = result.items;

  for (const i of items) {
    console.log(`id=${i.repositoryId}`);
  }

  let name = envVar.split('=')[0];
  let value = envVar.split('=')[1];

  //Update environment variable
  let response = await updateEnvironmentVariable(options.url, accessToken, items, name, value);

  //Check if other values are passed... if so, update each
  if (otherEnvVars) {
    for (const env of otherEnvVars) {
      name = env.split('=')[0];
      value = env.split('=')[1];
      //Update
      response =
        response + (await updateEnvironmentVariable(options.url, accessToken, items, name, value));
    }
  }

  return response;
}

/**
 * Set server-side extension environment variables
 *
 * @param  {string}  options    The url and application key.
 */
async function updateEnvironmentVariable(url, accessToken, items, name, value) {
  const payload = { name: name, value: value };
  let response = '';

  //Find name
  const item = items.find((i) => i.name === name);
  if (item) {
    //Environment variable exists
    console.log(`Environment variable exists. id=${item.id}`);
    //Update value
    response = await occ.updateEnvironmentVariable(
      url,
      accessToken,
      item.id,
      JSON.stringify(payload)
    );
  } else {
    //Environment variable does not exist
    console.log(`Environment variable does not exists. name=${name}`);
    //Create new
    response = await occ.createEnvironmentVariable(url, accessToken, JSON.stringify(payload));
  }

  return response;
}

/**
 * Delete server-side extension environment variables
 *
 * @param  {string}  options    The url and application key.
 */
async function deleteEnvironmentVariables(envVar, otherEnvVars, options) {
  let response = '';
  //Login
  const accessToken = await common.login(options.url, options.appKey);

  //Get list of environment variables
  const result = await occ.getEnvironmentVariables(options.url, accessToken);
  const items = result.items;

  let vars = [envVar];
  //vars.push(envVar);
  if (otherEnvVars) {
    envVars = vars.concat(otherEnvVars);
  }
  console.log(envVars);

  for (const v of envVars) {
    const item = items.find((i) => i.name === v);
    if (item) {
      //Environment variable exists
      console.log(`Environment variable exists. id=${item.id}`);
      //Update value
      response = await occ.deleteEnvironmentVariable(options.url, accessToken, item.id);
    } else {
      //Environment variable does not exist
      console.log(`Environment variable does not exist. name=${v}`);
      //Create new
      response = `Environment variable does not exist. name=${v}`;
    }
  }

  return response;
}

/**
 * Get Custom Site Settings
 *
 * @param  {string}  gatewayId  The custom gateways id.
 * @param  {string}  options    The url and application key.
 */
async function getSiteSettings(gatewayId, options) {
  const accessToken = await common.login(options.url, options.appKey);
  const response = await occ.getSiteSettings(options.url, gatewayId, accessToken);
  return response;
}

/**
 * Set Site Setting Config Data
 *
 * @param  {string}  gatewayId  The custom gateways id.
 * @param  {json}  payload  The custom gateways id.
 * @param  {string}  options    The url and application key.
 */
async function setSiteSettings(gatewayId, payload, options) {
  const accessToken = await common.login(options.url, options.appKey);

  let data = {};

  try {
    data = JSON.parse(payload);
  } catch {
    data = require(`${__dirname}/../../${payload}`);
  }

  const response = await occ.setSiteSettings(options.url, gatewayId, accessToken, data);
  return response;
}

/**
 * Run tests
 *
 * @param  {string}  options    The url and application key.
 */
async function runTests(appName, options) {
  const accessToken = await common.login(options.url, options.appKey);
  const response = await occ.runTests(
    options.url,
    accessToken,
    appName,
    options.maxAttempts,
    options.interval
  );
  return response;
}

/**
 * Upload Apple Pay domain association file
 *
 * @param  {string}  options    The file to upload.
 */
async function uploadAppleDomainAssociation(filePath, options) {
  process.env["NODE_TLS_REJECT_UNAUTHORIZED"]=0
  const accessToken = await common.login(options.url, options.appKey);
  return await occ.uploadAppleDomainAssociation(filePath, options.url, accessToken);
}

module.exports = {
  listApps,
  uploadApp,
  getServerLogs,
  getServerLogTail,
  downloadApp,
  listRoutes,
  getEnvironmentVariables,
  setEnvironmentVariables,
  deleteEnvironmentVariables,
  runTests,
  packageApp,
  uploadAppleDomainAssociation,
  getSiteSettings,
  setSiteSettings
};
