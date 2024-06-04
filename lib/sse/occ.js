//occ.js
const https = require('https');
const fs = require('fs-extra');
const common = require('../common/occ');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

require('async');

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};

async function listSSEFiles(url, accessToken) {
  let result = '';
  let json = {};

  console.debug(`[listSSEFiles]Connecting to ${url}`);
  //console.debug(`Token ${accessToken}`);

  const options = {
    method: 'GET',
    hostname: url,
    port: 443,
    path: '/ccadmin/v1/serverExtensions',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + accessToken
    },
    responseType: 'json'
  };

  // Return new promise
  return new Promise(function (resolve, reject) {
    // Make request
    const request = https.request(options, (response) => {
      response.on('data', function (chunk) {
        result += chunk;
      });
      response.on('end', function () {
        try {
          json = JSON.parse(result);
          resolve(json);
        } catch (error) {
          console.error(error.message);
        }
      });
      response.on('error', function (err) {
        console.error(err);
        reject(err);
      });
    });

    request.on('error', (error) => {
      console.error(error);
    });

    request.end();
  });
}

async function doSSEFileUploadMultipart(url, accessToken, appName, archiveFile) {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append('filename', `${appName}.zip`);
    form.append('uploadType', 'extensions');
    form.append('force', 'true');
    form.append('fileUpload', fs.createReadStream(archiveFile)); 
    axios.post(`https://${url}/ccadmin/v1/serverExtensions`, form, { headers: { 'Authorization': 'Bearer ' + accessToken, ...form.getHeaders() } })
      .then(successResponse => {
        if (successResponse.status === 200) {
          fs.removeSync(archiveFile);
        }
        resolve(successResponse.data);
      }).catch(rejectResponse => {
        const rejectMessage = rejectResponse.response ? rejectResponse.response.data : rejectResponse.message;
        resolve(rejectMessage);
        //request is not successful
        //directly send the message to resolve and it will be displayed on console by the caller.
      });
    // resolve(true);
  });
}

function getExtensionServerLogs(url, accessToken, date = '', loggingLevel = 'debug') {
  console.debug(`[getExtensionServerLogs]Connecting to ${url}`);

  //Check if date is empty, if empty set to today
  if (date === '') {
    date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  }
  // console.debug(`date: ${date}`);

  return new Promise((resolve, reject) => {
    const destDir = './server-logs';
    fs.ensureDirSync(destDir);

    const dest = `${destDir}/logs-${date}.zip`;
    const file = fs.createWriteStream(dest, { flags: 'wx' });

    const options = {
      method: 'GET',
      hostname: url,
      port: 443,
      path: `/ccadminx/custom/v1/logs?loggingLevel=${loggingLevel}&date=${date}&format=zip`,
      headers: {
        'Content-Type': 'application/x-zip-compressed',
        Authorization: 'Bearer ' + accessToken
      },
      responseType: 'json'
    };

    console.debug(`path: ${options.path}`);

    const request = https.request(options, (response) => {
      if (response.statusCode === 200) {
        console.log(`OK.Server responded with ${response.statusCode}: ${response.statusMessage}`);
        response.pipe(file);
      } else {
        console.log(`Server responded with ${response.statusCode}: ${response.statusMessage}`);
        file.close();
        fs.unlink(dest, noop); // Delete temp file
        reject(`Server responded with ${response.statusCode}: ${response.statusMessage}`);
      }
    });

    request.on('error', (err) => {
      file.close();
      fs.unlink(dest, noop); // Delete temp file
      reject(err.message);
    });

    request.end();

    file.on('finish', () => {
      const json = {
        filename: dest,
        logDate: date,
        loggingLevel: loggingLevel
      };
      resolve(json);
    });

    file.on('error', (err) => {
      file.close();

      if (err.code === 'EEXIST') {
        reject('File already exists');
      } else {
        fs.unlink(dest, noop); // Delete temp file
        reject(err.message);
      }
    });
  });
}

function getExtensionServerLogTail(url, accessToken, date = '', loggingLevel = 'debug') {
  console.debug(`[getExtensionServerLogTail]Connecting to ${url}`);

  //Check if date is empty, if empty set to today
  if (date === '') {
    date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  }
  // console.debug(`date: ${date}`);

  let result = '';

  // Return new promise
  return new Promise(function (resolve, reject) {
    const options = {
      method: 'GET',
      hostname: url,
      port: 443,
      path: `/ccadminx/custom/v1/logs/tail?loggingLevel=${loggingLevel}&date=${date}`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + accessToken
      },
      responseType: 'json'
    };

    // Make request
    const request = https.request(options, (response) => {
      response.on('data', function (chunk) {
        result += chunk;
      });
      response.on('end', function () {
        try {
          // json = JSON.parse(result);
          json = result;
          resolve(json);
        } catch (error) {
          console.error(error.message);
        }
      });
      response.on('error', function (err) {
        console.error(err);
        reject(err);
      });
    });

    request.on('error', (error) => {
      console.error(error);
    });

    request.end();
  });
}

function doDownloadSSEFile(url, accessToken, appName) {
  console.debug(`[doDownloadSSEFile]Connecting to ${url}`);

  //set date string to today; append to downloaded file name
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');

  return new Promise((resolve, reject) => {
    const destDir = './downloaded-assets';
    fs.ensureDirSync(destDir);

    const dest = `${destDir}/${appName}-${date}.zip`;
    const file = fs.createWriteStream(dest, { flags: 'wx' });

    const options = {
      method: 'GET',
      hostname: url,
      port: 443,
      path: `/ccadmin/v1/serverExtensions/${appName}.zip`,
      headers: {
        Authorization: 'Bearer ' + accessToken
      },
      responseType: 'json'
    };

    console.debug(`path: ${options.path}`);

    const request = https.request(options, (response) => {
      if (response.statusCode === 200) {
        console.log(`OK.Server responded with ${response.statusCode}: ${response.statusMessage}`);
        response.pipe(file);
      } else {
        console.log(`Server responded with ${response.statusCode}: ${response.statusMessage}`);
        file.close();
        fs.unlink(dest, noop); // Delete temp file
        reject(`Server responded with ${response.statusCode}: ${response.statusMessage}`);
      }
    });

    request.on('error', (err) => {
      file.close();
      fs.unlink(dest, noop); // Delete temp file
      reject(err.message);
    });

    request.end();

    file.on('finish', () => {
      const json = {
        name: appName,
        filename: dest,
        downloadDate: date
      };
      resolve(json);
    });

    file.on('error', (err) => {
      file.close();

      if (err.code === 'EEXIST') {
        reject('File already exists');
      } else {
        fs.unlink(dest, noop); // Delete temp file
        reject(err.message);
      }
    });
  });
}

async function getEnvironmentVariables(url, accessToken) {
  let result = '';
  let json = {};

  console.debug(`[getEnvironmentVariables]Connecting to ${url}`);

  const options = {
    method: 'GET',
    hostname: url,
    port: 443,
    path: '/ccadmin/v1/extensionEnvironmentVariables',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + accessToken
    },
    responseType: 'json'
  };

  // Return new promise
  return new Promise(function (resolve, reject) {
    // Make request
    const request = https.request(options, (response) => {
      response.on('data', function (chunk) {
        result += chunk;
      });
      response.on('end', function () {
        try {
          json = JSON.parse(result);
          resolve(json);
        } catch (error) {
          console.error(error.message);
        }
      });
      response.on('error', function (err) {
        console.error(err);
        reject(err);
      });
    });

    request.on('error', (error) => {
      console.error(error);
    });

    request.end();
  });
}

async function createEnvironmentVariable(url, accessToken, payload) {
  let result = '';
  let json = {};

  console.debug(`[createEnvironmentVariable]Connecting to ${url}`);
  //console.debug(`[createEnvironmentVariable]Payload ${payload}`);

  const options = {
    method: 'POST',
    hostname: url,
    port: 443,
    path: '/ccadmin/v1/extensionEnvironmentVariables',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + accessToken
    },
    responseType: 'json'
  };

  // Return new promise
  return new Promise(function (resolve, reject) {
    // Make request
    const request = https.request(options, (response) => {
      response.on('data', function (chunk) {
        result += chunk;
      });
      response.on('end', function () {
        try {
          json = JSON.parse(result);
          resolve(json);
        } catch (error) {
          console.error(error.message);
        }
      });
      response.on('error', function (err) {
        console.error(err);
        reject(err);
      });
    });

    request.on('error', (error) => {
      console.error(error);
    });

    request.write(payload);
    request.end();
  });
}

async function updateEnvironmentVariable(url, accessToken, id, payload) {
  let result = '';
  let json = {};

  console.debug(`[updateEnvironmentVariable]Connecting to ${url}`);
  console.debug(`[updateEnvironmentVariable]Payload ${payload}`);

  const options = {
    method: 'PUT',
    hostname: url,
    port: 443,
    path: '/ccadmin/v1/extensionEnvironmentVariables/' + id,
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + accessToken
    },
    responseType: 'json'
  };

  // Return new promise
  return new Promise(function (resolve, reject) {
    // Make request
    const request = https.request(options, (response) => {
      response.on('data', function (chunk) {
        result += chunk;
      });
      response.on('end', function () {
        try {
          json = JSON.parse(result);
          resolve(json);
        } catch (error) {
          console.error(error.message);
        }
      });
      response.on('error', function (err) {
        console.error(err);
        reject(err);
      });
    });

    request.on('error', (error) => {
      console.error(error);
    });

    request.write(payload);
    request.end();
  });
}

async function deleteEnvironmentVariable(url, accessToken, id) {
  let result = '';
  let json = {};

  console.debug(`[deleteEnvironmentVariable]Connecting to ${url}`);

  const options = {
    method: 'DELETE',
    hostname: url,
    port: 443,
    path: '/ccadmin/v1/extensionEnvironmentVariables/' + id,
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + accessToken
    },
    responseType: 'json'
  };

  // Return new promise
  return new Promise(function (resolve, reject) {
    // Make request
    const request = https.request(options, (response) => {
      response.on('data', function (chunk) {
        result += chunk;
      });
      response.on('end', function () {
        try {
          json = JSON.parse(result);
          resolve(json);
        } catch (error) {
          console.error(error.message);
        }
      });
      response.on('error', function (err) {
        console.error(err);
        reject(err);
      });
    });

    request.on('error', (error) => {
      console.error(error);
    });

    request.end();
  });
}

async function getSiteSettings(url, gatewayId, accessToken) {
  let result = '';
  let json = {};

  console.debug(`[getSiteSettings]Connecting to ${url}`);

  const options = {
    method: 'GET',
    hostname: url,
    port: 443,
    path: `/ccadmin/v1/sitesettings/${gatewayId}`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + accessToken
    },
    responseType: 'json'
  };

  // Return new promise
  return new Promise(function (resolve, reject) {
    // Make request
    const request = https.request(options, (response) => {
      response.on('data', function (chunk) {
        result += chunk;
      });
      response.on('end', function () {
        try {
          json = JSON.parse(result);
          resolve(json);
        } catch (error) {
          console.error(error.message);
        }
      });
      response.on('error', function (err) {
        console.error(err);
        reject(err);
      });
    });

    request.on('error', (error) => {
      console.error(error);
    });

    request.end();
  });
}

async function setSiteSettings(url, gatewayId, accessToken, payload) {
  let result = '';
  let json = {};

  console.debug(`[setSiteSettings]Connecting to ${url}`);
  console.debug(`[setSiteSettings]Payload ${payload}`);

  const settings = {
    preview: payload,
    storefront: payload,
    agent: payload
  };

  const options = {
    method: 'PUT',
    hostname: url,
    port: 443,
    path: `/ccadmin/v1/sitesettings/${gatewayId}`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + accessToken
    },
    responseType: 'json'
  };

  // Return new promise
  return new Promise(function (resolve, reject) {
    // Make request
    const request = https.request(options, (response) => {
      response.on('data', function (chunk) {
        result += chunk;
      });
      response.on('end', function () {
        try {
          json = JSON.parse(result);
          resolve(json);
        } catch (error) {
          console.error(error.message);
        }
      });
      response.on('error', function (err) {
        console.error(err);
        reject(err);
      });
    });

    request.on('error', (error) => {
      console.error(error);
    });

    request.write(JSON.stringify(settings));
    request.end();
  });
}

async function runTests(url, accessToken, extensionName, maxAttempts, waitInterval) {
  const testStatusUrl = await startTestJob(url, accessToken, extensionName);

  //let whileLoop = true;
  //console.log("*** API Polling Started ***")

  //const response = await getTestStatus(testStatusUrl, accessToken);

  poll({
    fn: getTestStatus,
    validate: validateTestStatus,
    url: testStatusUrl,
    accessToken: accessToken,
    interval: waitInterval,
    maxAttempts: maxAttempts
  })
    .then('Complete!')
    .catch((err) => console.error(err));

  //return response;
}

async function startTestJob(url, accessToken, extensionName) {
  console.debug(`[startTestJob]Connecting to ${url}`);

  //Set payload
  const payload = JSON.stringify({ extensionName: extensionName });

  const options = {
    method: 'POST',
    hostname: url,
    port: 443,
    path: '/ccadminx/custom/v1/testJobs',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': payload.length,
      Authorization: 'Bearer ' + accessToken
    },
    responseType: 'json'
  };

  // Return new promise
  return new Promise(function (resolve, reject) {
    // Make request
    const request = https.request(options, (response) => {
      //Read response; expect 202: Accepted and return 'location' header
      const statusCode = response.statusCode;
      console.log('statusCode:', statusCode);
      if (statusCode == 202) {
        resolve(response.headers['location']);
      } else {
        reject(`HTTP Response: ${statusCode}`);
      }

      response.on('error', function (err) {
        console.error(err);
        reject(err);
      });
    });

    request.on('error', (error) => {
      console.error(error);
    });

    request.write(payload);
    request.end();
  });
}

async function getTestStatus(url, accessToken) {
  let result = '';
  console.debug(`[getTestStatus]Connecting to ${url}`);

  const options = {
    method: 'GET',
    port: 443,
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + accessToken
    },
    responseType: 'json'
  };

  // Return new promise
  return new Promise(function (resolve, reject) {
    // Make request
    const request = https.get(url, options, (response) => {
      //Read response
      console.log('statusCode:', response.statusCode);

      response.on('data', function (chunk) {
        result += chunk;
      });
      response.on('end', function () {
        try {
          console.debug(result);
          //json = JSON.parse(result);
          resolve(JSON.parse(result));
        } catch (error) {
          console.error(error.message);
        }
      });

      response.on('error', function (err) {
        console.error(err);
        reject(err);
      });
    });

    request.on('error', (error) => {
      console.error(error);
    });

    request.end();
  });
}

function validateTestStatus(response) {
  console.log(
    `Progress: ${response['progress']}; Percent Complete: ${response['completedPercentage']}`
  );
  return response['completed'] === 'true';
}

const poll = async ({ fn, validate, url, accessToken, interval, maxAttempts }) => {
  console.log('Start poll...');
  let attempts = 0;

  const executePoll = async (resolve, reject) => {
    console.log('- poll');
    const result = await fn(url, accessToken);
    attempts++;

    if (validate(result)) {
      return resolve(result);
    } else if (maxAttempts && attempts === maxAttempts) {
      return reject(new Error('Exceeded max attempts'));
    } else {
      setTimeout(executePoll, interval, resolve, reject);
    }
  };

  return new Promise(executePoll);
};

async function uploadAppleDomainAssociation(filePath, url, accessToken) {
  const destFolder = '/thirdparty/.well-known/';
  await common.createFolder(url, destFolder, accessToken);
  const fileName = path.basename(filePath);
  const fileToken = await common.uploadFile(url, accessToken, `${destFolder}${fileName}`);
  const base64String = await common.base64Encode(filePath);

  return await common.doFileSegmentUpload(
    url,
    accessToken,
    fileToken,
    `${destFolder}${fileName}`,
    base64String
  );
}

module.exports = {
  listSSEFiles,
  doSSEFileUploadMultipart,
  getExtensionServerLogs,
  getExtensionServerLogTail,
  doDownloadSSEFile,
  getEnvironmentVariables,
  createEnvironmentVariable,
  updateEnvironmentVariable,
  deleteEnvironmentVariable,
  runTests,
  uploadAppleDomainAssociation,
  getSiteSettings,
  setSiteSettings
};