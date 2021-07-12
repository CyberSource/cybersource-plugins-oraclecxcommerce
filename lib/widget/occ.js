//occ.js
/* eslint-disable @typescript-eslint/no-var-requires */

const https = require('https');

async function createApplicationId(url, accessToken, extensionName) {
  let result = '';

  console.debug(`[createApplicationId]Connecting to ${url}`);

  // form data
  const payload = JSON.stringify({ name: extensionName, type: 'extension' });

  // request option
  const options = {
    host: url,
    port: 443,
    method: 'POST',
    path: '/ccadmin/v1/applicationIds',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': payload.length,
      Authorization: 'Bearer ' + accessToken
    }
  };

  // Return new promise
  return new Promise(function (resolve, reject) {
    // request object
    const req = https.request(options, function (res) {
      res.on('data', function (chunk) {
        result += chunk;
      });
      res.on('end', function () {
        try {
          const json = JSON.parse(result);
          //console.debug(`Got an Admin authorization token, value: '${result}'`);
          resolve(json['id']);
        } catch (error) {
          console.error(error.message);
        }
      });
      res.on('error', function (err) {
        console.error(err);
        reject(err);
      });
    });

    // req error
    req.on('error', function (err) {
      console.error(err);
    });

    //send request with the postData form
    req.write(payload);
    req.end();
  });
}

async function createExtension(url, accessToken, extensionName) {
  let result = '';

  console.debug(`[createExtension]Connecting to ${url}`);

  // Form data. Assume each file requires only 1 segment to upload
  const payload = JSON.stringify({ name: extensionName });
  //console.log(payload);

  // request option
  const options = {
    host: url,
    port: 443,
    method: 'POST',
    path: '/ccadmin/v1/extensions',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': payload.length,
      Authorization: 'Bearer ' + accessToken
    }
  };

  // Return new promise
  return new Promise(function (resolve, reject) {
    // request object
    const req = https.request(options, function (res) {
      res.on('data', function (chunk) {
        result += chunk;
      });
      res.on('end', function () {
        try {
          resolve(result);
        } catch (error) {
          console.error(error.message);
        }
      });
      res.on('error', function (err) {
        console.error(err);
        reject(err);
      });
    });

    // req error
    req.on('error', function (err) {
      console.error(err);
    });

    //send request with the postData form
    req.write(payload);
    req.end();
  });
}

async function listExtensions(url, accessToken) {
  let result = '';
  let json = {};

  console.debug(`[listExtensions]Connecting to ${url}`);
  //console.debug(`Token ${accessToken}`);

  const options = {
    method: 'GET',
    hostname: url,
    port: 443,
    path: '/ccadmin/v1/extensions',
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
          //console.debug(result);
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

async function processExtension(url, accessToken, extensionId, op) {
  let result = '';

  console.debug(`[processExtension]Connecting to ${url}`);

  // Payload. op: The operation to perform, can be one of activate or deactivate.
  const payload = JSON.stringify({ op: op });

  // request option
  const options = {
    host: url,
    port: 443,
    method: 'POST',
    path: '/ccadmin/v1/extensions/' + extensionId,
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': payload.length,
      Authorization: 'Bearer ' + accessToken
    }
  };

  // Return new promise
  return new Promise(function (resolve, reject) {
    // request object
    const req = https.request(options, function (res) {
      res.on('data', function (chunk) {
        result += chunk;
      });
      res.on('end', function () {
        try {
          resolve(result);
        } catch (error) {
          console.error(error.message);
        }
      });
      res.on('error', function (err) {
        console.error(err);
        reject(err);
      });
    });

    // req error
    req.on('error', function (err) {
      console.error(err);
    });

    //send request with the postData form
    req.write(payload);
    req.end();
  });
}

async function deleteExtension(url, accessToken, extensionId) {
  let result = '';

  console.debug(`[processExtension]Connecting to ${url}`);

  // Payload. op: The operation to perform, can be one of activate or deactivate.
  //const payload = JSON.stringify({'op': op});

  // request option
  const options = {
    host: url,
    port: 443,
    method: 'DELETE',
    path: '/ccadmin/v1/extensions/' + extensionId,
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + accessToken
    }
  };

  // Return new promise
  return new Promise(function (resolve, reject) {
    // request object
    const req = https.request(options, function (res) {
      res.on('data', function (chunk) {
        result += chunk;
      });
      res.on('end', function () {
        try {
          resolve(result);
        } catch (error) {
          console.error(error.message);
        }
      });
      res.on('error', function (err) {
        console.error(err);
        reject(err);
      });
    });

    // req error
    req.on('error', function (err) {
      console.error(err);
    });

    //send request with the postData form
    //req.write(payload);
    req.end();
  });
}

module.exports = {
  createApplicationId,
  createExtension,
  processExtension,
  listExtensions,
  deleteExtension
};
